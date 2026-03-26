"""
Payment Routes for Razorpay Integration
Handles order creation, payment verification, and subscription management
"""
import hashlib
import hmac
import os
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from loguru import logger
from pydantic import BaseModel
from sqlmodel import Session, select

# Import Razorpay SDK (will be installed via requirements.txt)
try:
    import razorpay
    RAZORPAY_AVAILABLE = True
except ImportError:
    logger.warning("Razorpay SDK not installed. Payment features will be disabled.")
    RAZORPAY_AVAILABLE = False

from auth import get_current_user
from db import User
from payment_models import PaymentTransaction, UserSubscription
from rate_limiter import RATE_LIMITS, limiter


# Request/Response Models
class CreateOrderRequest(BaseModel):
    plan_id: str  # 'pro' or 'enterprise'
    billing_cycle: str  # 'monthly' or 'yearly'


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int  # in paise (₹999 = 99900 paise)
    currency: str
    receipt: str
    payment_url: str | None = None  # URL for mobile checkout


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_id: str
    billing_cycle: str


class VerifyPaymentResponse(BaseModel):
    success: bool
    message: str
    subscription_expires_at: datetime | None = None


class SubscriptionStatusResponse(BaseModel):
    plan_type: str  # 'free' or 'premium'
    access_expires_at: datetime | None = None
    is_active: bool
    days_remaining: int | None = None


# Pricing Configuration (in INR, in paise for Razorpay)
PRICING = {
    'pro': {
        'monthly': 99900,  # ₹999
        'yearly': 666 * 12 * 100,  # ₹666/month * 12 months = ₹7,992
    },
    'enterprise': {
        'monthly': 400000,  # ₹4000
        'yearly': 3333 * 12 * 100,  # ₹3333/month * 12 months = ₹39,996
    }
}

# Subscription Duration
SUBSCRIPTION_DURATION = {
    'monthly': 30,  # days
    'yearly': 365,  # days
}


def register_payment_routes(app, get_session_func):
    """Register payment routes with the FastAPI app"""
    router = APIRouter(prefix="/api/v1/payments", tags=["payments"])

    # Initialize Razorpay client
    razorpay_key_id = os.getenv('RAZORPAY_KEY_ID', '')
    razorpay_key_secret = os.getenv('RAZORPAY_KEY_SECRET', '')

    # Validate Razorpay keys — refuse to start with placeholder values
    _keys_valid = (
        razorpay_key_id
        and razorpay_key_secret
        and not razorpay_key_id.startswith('your_')
        and not razorpay_key_secret.startswith('your_')
        and razorpay_key_secret != 'placeholder_secret'
    )

    if RAZORPAY_AVAILABLE and _keys_valid:
        try:
            razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))
            logger.info("Razorpay client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Razorpay client: {e}")
            razorpay_client = None
    else:
        razorpay_client = None
        if not _keys_valid:
            logger.warning(
                "Razorpay keys not configured or using placeholders. "
                "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env to enable payments."
            )
        else:
            logger.warning("Razorpay SDK not installed")

    @router.post("/create-order", response_model=CreateOrderResponse)
    @limiter.limit(RATE_LIMITS["payment"])  # 20/minute
    async def create_payment_order(
        request: Request,
        payload: CreateOrderRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_session_func)
    ):
        """Create a Razorpay order for subscription payment"""

        logger.info(f"Payment order creation attempt for user: {current_user.email if current_user else 'None'}")

        if not razorpay_client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment service is not configured. Please contact support."
            )

        # Validate plan_id and billing_cycle
        if payload.plan_id not in PRICING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid plan_id: {payload.plan_id}"
            )

        if payload.billing_cycle not in ['monthly', 'yearly']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid billing_cycle: {payload.billing_cycle}"
            )

        # Get amount based on plan and billing cycle
        amount = PRICING[payload.plan_id][payload.billing_cycle]

        # Create unique receipt ID
        receipt = f"{current_user.id}_{payload.plan_id}_{payload.billing_cycle}_{int(datetime.now(UTC).timestamp())}"

        try:
            # Create Razorpay order
            order_data = {
                "amount": amount,
                "currency": "INR",
                "receipt": receipt,
                "notes": {
                    "user_id": current_user.id,
                    "plan_id": payload.plan_id,
                    "billing_cycle": payload.billing_cycle,
                }
            }

            razorpay_order = razorpay_client.order.create(data=order_data)

            # Save to database
            transaction = PaymentTransaction(
                user_id=current_user.id,
                razorpay_order_id=razorpay_order['id'],
                amount=amount / 100,  # Convert paise to rupees for storage
                currency="INR",
                status="created"
            )
            db.add(transaction)
            db.commit()

            logger.info(f"Created order {razorpay_order['id']} for user {current_user.id}")

            # Generate checkout URL for mobile apps
            base_url = str(request.base_url).rstrip('/')
            checkout_url = f"{base_url}/api/v1/payments/checkout/{razorpay_order['id']}?plan_id={payload.plan_id}&billing_cycle={payload.billing_cycle}"
            
            return CreateOrderResponse(
                order_id=razorpay_order['id'],
                amount=amount,
                currency="INR",
                receipt=receipt,
                payment_url=checkout_url
            )

        except Exception as e:
            logger.error(f"Failed to create Razorpay order: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create payment order. Please try again later."
            )

    @router.get("/checkout/{order_id}")
    async def checkout_page(
        request: Request,
        order_id: str,
        plan_id: str = "pro",
        billing_cycle: str = "monthly"
    ):
        """Serve a checkout HTML page with Razorpay JS SDK for mobile apps"""
        
        # Fetch order details from Razorpay
        if not razorpay_client:
            from fastapi.responses import HTMLResponse
            return HTMLResponse(content="<html><body><h1>Payment service unavailable</h1></body></html>", status_code=503)
        
        try:
            order = razorpay_client.order.fetch(order_id)
        except Exception as e:
            from fastapi.responses import HTMLResponse
            return HTMLResponse(content=f"<html><body><h1>Order not found: {e}</h1></body></html>", status_code=404)
        
        # Get plan description
        plan_name = plan_id.capitalize()
        amount_display = order['amount'] / 100  # Convert paise to rupees
        
        # Base URL for callback
        base_url = str(request.base_url).rstrip('/')
        verify_url = f"{base_url}/api/v1/payments/verify-mobile"
        
        # Razorpay checkout HTML page
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BodyScan AI - Payment</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }}
        .container {{
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 400px;
            width: 100%;
        }}
        .logo {{ font-size: 48px; margin-bottom: 20px; }}
        h1 {{ color: #fff; font-size: 24px; margin-bottom: 10px; }}
        .plan {{ color: #8B5CF6; font-size: 18px; margin-bottom: 20px; }}
        .amount {{ color: #fff; font-size: 36px; font-weight: bold; margin-bottom: 30px; }}
        .amount span {{ font-size: 18px; color: #888; }}
        .pay-button {{
            background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
            color: white;
            border: none;
            padding: 16px 40px;
            font-size: 18px;
            font-weight: 600;
            border-radius: 12px;
            cursor: pointer;
            width: 100%;
            transition: transform 0.2s, box-shadow 0.2s;
        }}
        .pay-button:hover {{ transform: translateY(-2px); box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4); }}
        .pay-button:disabled {{ opacity: 0.5; cursor: not-allowed; }}
        .secure {{ color: #666; font-size: 12px; margin-top: 20px; }}
        .loading {{ display: none; color: #888; margin-top: 20px; }}
        .success {{ display: none; color: #10B981; font-size: 18px; margin-top: 20px; }}
        .error {{ display: none; color: #EF4444; font-size: 14px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">💎</div>
        <h1>BodyScan AI</h1>
        <div class="plan">{plan_name} Plan - {billing_cycle.capitalize()}</div>
        <div class="amount">₹{amount_display:.0f}<span>/{"mo" if billing_cycle == "monthly" else "yr"}</span></div>
        <button class="pay-button" onclick="startPayment()">Pay Now</button>
        <div class="loading" id="loading">Processing payment...</div>
        <div class="success" id="success">✅ Payment successful! Redirecting...</div>
        <div class="error" id="error"></div>
        <div class="secure">🔒 Secured by Razorpay</div>
    </div>

    <script>
        const options = {{
            key: '{razorpay_key_id}',
            amount: {order['amount']},
            currency: '{order['currency']}',
            name: 'BodyScan AI',
            description: '{plan_name} Plan - {billing_cycle.capitalize()}',
            order_id: '{order_id}',
            prefill: {{}},
            theme: {{ color: '#8B5CF6' }},
            handler: async function(response) {{
                document.querySelector('.pay-button').disabled = true;
                document.getElementById('loading').style.display = 'block';
                
                try {{
                    const verifyResponse = await fetch('{verify_url}', {{
                        method: 'POST',
                        headers: {{ 'Content-Type': 'application/json' }},
                        body: JSON.stringify({{
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan_id: '{plan_id}',
                            billing_cycle: '{billing_cycle}'
                        }})
                    }});
                    
                    const result = await verifyResponse.json();
                    document.getElementById('loading').style.display = 'none';
                    
                    if (result.success) {{
                        document.getElementById('success').style.display = 'block';
                        // Try to close the browser or redirect
                        setTimeout(() => {{
                            window.close();
                            // Fallback: show success message
                            document.getElementById('success').innerHTML = '✅ Payment successful! You can close this window and return to the app.';
                        }}, 2000);
                    }} else {{
                        document.getElementById('error').style.display = 'block';
                        document.getElementById('error').textContent = result.message || 'Payment verification failed';
                        document.querySelector('.pay-button').disabled = false;
                    }}
                }} catch (e) {{
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('error').style.display = 'block';
                    document.getElementById('error').textContent = 'Verification failed. Please contact support.';
                    document.querySelector('.pay-button').disabled = false;
                }}
            }},
            modal: {{
                ondismiss: function() {{
                    document.getElementById('error').style.display = 'block';
                    document.getElementById('error').textContent = 'Payment cancelled';
                }}
            }}
        }};

        function startPayment() {{
            const rzp = new Razorpay(options);
            rzp.open();
        }}
        
        // Auto-open Razorpay on page load
        window.onload = function() {{
            setTimeout(startPayment, 500);
        }};
    </script>
</body>
</html>
"""
        from fastapi.responses import HTMLResponse
        return HTMLResponse(content=html_content)

    @router.post("/verify-mobile")
    async def verify_mobile_payment(
        request: Request,
        db: Session = Depends(get_session_func)
    ):
        """Verify payment from mobile checkout page (no auth required since it comes from HTML form)"""
        
        try:
            payload = await request.json()
            razorpay_order_id = payload.get('razorpay_order_id')
            razorpay_payment_id = payload.get('razorpay_payment_id')
            razorpay_signature = payload.get('razorpay_signature')
            plan_id = payload.get('plan_id', 'pro')
            billing_cycle = payload.get('billing_cycle', 'monthly')
            
            if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
                return {"success": False, "message": "Missing payment details"}
            
            # Verify signature using the validated key from startup
            if not razorpay_key_secret:
                logger.error("Razorpay key secret not configured — cannot verify payment")
                return {"success": False, "message": "Payment service not configured"}

            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            expected_signature = hmac.new(
                razorpay_key_secret.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(expected_signature, razorpay_signature):
                logger.warning(f"Invalid signature for order {razorpay_order_id}")
                return {"success": False, "message": "Invalid payment signature"}
            
            # Find the transaction
            transaction = db.exec(
                select(PaymentTransaction).where(
                    PaymentTransaction.razorpay_order_id == razorpay_order_id
                )
            ).first()
            
            if not transaction:
                logger.error(f"Transaction not found for order {razorpay_order_id}")
                return {"success": False, "message": "Transaction not found"}
            
            # Update transaction
            transaction.razorpay_payment_id = razorpay_payment_id
            transaction.status = "paid"
            
            # Calculate subscription expiry
            duration_days = SUBSCRIPTION_DURATION[billing_cycle]
            expires_at = datetime.now(UTC) + timedelta(days=duration_days)
            
            # Create or update subscription
            subscription = db.exec(
                select(UserSubscription).where(
                    UserSubscription.user_id == transaction.user_id
                )
            ).first()
            
            if subscription:
                subscription.plan_type = "premium"
                subscription.access_expires_at = expires_at
            else:
                subscription = UserSubscription(
                    user_id=transaction.user_id,
                    plan_type="premium",
                    access_expires_at=expires_at
                )
                db.add(subscription)
            
            db.commit()
            
            logger.info(f"Mobile payment verified for user {transaction.user_id}")

            # Send payment receipt email (non-blocking)
            try:
                from email_service import send_payment_receipt_email

                # Look up user email
                user = db.exec(select(User).where(User.id == transaction.user_id)).first()
                if user:
                    import random
                    import string
                    invoice_number = f"INV-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"
                    plan_display_name = "Pro (Monthly)" if billing_cycle == "monthly" else "Pro (Yearly)"

                    send_payment_receipt_email(
                        email=user.email,
                        user_name=user.full_name or "User",
                        amount=transaction.amount,
                        plan_name=plan_display_name,
                        payment_id=razorpay_payment_id,
                        invoice_number=invoice_number,
                        valid_until=expires_at.strftime("%b %d, %Y"),
                    )
                    logger.info(f"✅ Payment receipt email sent to {user.email}")
            except Exception as e:
                logger.error(f"Email receipt error (non-critical): {e!s}")
            
            return {"success": True, "message": "Payment successful", "expires_at": expires_at.isoformat()}
            
        except Exception as e:
            logger.error(f"Mobile payment verification failed: {e}")
            return {"success": False, "message": str(e)}

    @router.post("/verify", response_model=VerifyPaymentResponse)
    @limiter.limit(RATE_LIMITS["payment"])  # 20/minute
    async def verify_payment(
        request: Request,
        payload: VerifyPaymentRequest,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_session_func)
    ):
        """Verify Razorpay payment signature and activate subscription"""

        # Verify signature
        generated_signature = hmac.new(
            razorpay_key_secret.encode(),
            f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()

        if generated_signature != payload.razorpay_signature:
            logger.warning(f"Invalid payment signature for user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment signature. Payment verification failed."
            )

        # Update transaction status
        transaction = db.exec(
            select(PaymentTransaction).where(
                PaymentTransaction.razorpay_order_id == payload.razorpay_order_id
            )
        ).first()

        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found"
            )

        transaction.razorpay_payment_id = payload.razorpay_payment_id
        transaction.razorpay_signature = payload.razorpay_signature
        transaction.status = "paid"

        # Calculate expiry date
        duration_days = SUBSCRIPTION_DURATION[payload.billing_cycle]
        expiry_date = datetime.now(UTC) + timedelta(days=duration_days)

        # Update or create subscription
        subscription = db.exec(
            select(UserSubscription).where(
                UserSubscription.user_id == current_user.id
            )
        ).first()

        if subscription:
            subscription.plan_type = "premium"
            subscription.access_expires_at = expiry_date
            subscription.last_payment_id = payload.razorpay_payment_id
            subscription.updated_at = datetime.now(UTC)
        else:
            subscription = UserSubscription(
                user_id=current_user.id,
                plan_type="premium",
                access_expires_at=expiry_date,
                last_payment_id=payload.razorpay_payment_id
            )
            db.add(subscription)

        db.commit()

        logger.info(f"Payment verified and subscription activated for user {current_user.id} until {expiry_date}")

        # Send payment receipt email (async, non-blocking)
        try:
            from email_service import send_payment_receipt_email

            # Generate invoice number
            import random
            import string
            invoice_number = f"INV-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"

            plan_display_name = "Pro (Monthly)" if payload.billing_cycle == "monthly" else "Pro (Yearly)"
            amount_inr = transaction.amount  # Already stored in rupees

            email_sent = send_payment_receipt_email(
                email=current_user.email,
                user_name=current_user.full_name or "User",
                amount=amount_inr,
                plan_name=plan_display_name,
                payment_id=payload.razorpay_payment_id,
                invoice_number=invoice_number,
                valid_until=expiry_date.strftime("%b %d, %Y"),
            )

            if email_sent:
                logger.info(f"✅ Payment receipt email sent to {current_user.email}")
            else:
                logger.warning(f"⚠️ Payment receipt email not sent (SMTP not configured or failed)")

        except Exception as e:
            # Don't fail the payment if email fails
            logger.error(f"Email receipt error (non-critical): {e!s}")

        return VerifyPaymentResponse(
            success=True,
            message="Payment successful! Your subscription is now active.",
            subscription_expires_at=expiry_date
        )

    @router.get("/subscription-status", response_model=SubscriptionStatusResponse)
    @limiter.limit(RATE_LIMITS["default"])  # 60/minute
    async def get_subscription_status(
        request: Request,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_session_func)
    ):
        """Get current user's subscription status"""

        subscription = db.exec(
            select(UserSubscription).where(
                UserSubscription.user_id == current_user.id
            )
        ).first()

        if not subscription or subscription.plan_type == "free":
            return SubscriptionStatusResponse(
                plan_type="free",
                access_expires_at=None,
                is_active=True,
                days_remaining=None
            )

        # Check if subscription is still active
        now = datetime.now(UTC)
        # Ensure access_expires_at is timezone-aware for comparison
        expires_at = subscription.access_expires_at
        if expires_at and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)
        is_active = expires_at and expires_at > now

        days_remaining = None
        if expires_at and is_active:
            days_remaining = (expires_at - now).days

        return SubscriptionStatusResponse(
            plan_type=subscription.plan_type,
            access_expires_at=subscription.access_expires_at,
            is_active=is_active,
            days_remaining=days_remaining
        )

    # Register router with app
    app.include_router(router)
    logger.info("Payment routes registered successfully")


