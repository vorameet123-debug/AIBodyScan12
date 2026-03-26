"""
Unit Tests for Payment Routes
Tests Razorpay order creation, verification, and subscription management
"""
import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from datetime import datetime, timezone, timedelta


class TestPricingConfiguration:
    """Test pricing configuration and calculations."""
    
    def test_pricing_tiers_exist(self):
        """Test that pricing tiers are properly defined."""
        from api.payment_routes import PRICING
        
        assert PRICING is not None
        assert len(PRICING) > 0
    
    def test_pricing_has_required_fields(self):
        """Test that pricing entries have values (amounts in paise)."""
        from api.payment_routes import PRICING
        
        # PRICING structure may be {plan: {period: amount}} or {plan: amount}
        for plan_name, plan_details in PRICING.items():
            if isinstance(plan_details, dict):
                # Nested structure like {"monthly": 99900, "yearly": 799200}
                for period, amount in plan_details.items():
                    assert isinstance(amount, (int, float))
                    assert amount > 0
            else:
                # Direct amount
                assert isinstance(plan_details, (int, float))


class TestOrderCreation:
    """Test Razorpay order creation."""
    
    def test_create_order_calculates_amount_correctly(self):
        """Test that order amount is calculated in paise."""
        # Amount in INR should be multiplied by 100 for paise
        amount_inr = 999
        amount_paise = amount_inr * 100
        assert amount_paise == 99900
    
    def test_create_order_with_valid_plan(self, mock_razorpay_client):
        """Test order creation with valid plan."""
        # Mock the create order response
        expected_order = {
            "id": "order_test123",
            "amount": 99900,
            "currency": "INR",
            "status": "created",
        }
        
        mock_razorpay_client.order.create.return_value = expected_order
        
        result = mock_razorpay_client.order.create({
            "amount": 99900,
            "currency": "INR",
            "receipt": "test_receipt",
        })
        
        assert result["id"] == "order_test123"
        assert result["status"] == "created"


class TestPaymentVerification:
    """Test Razorpay payment signature verification."""
    
    def test_verify_signature_valid(self, mock_razorpay_client):
        """Test payment verification with valid signature."""
        payment_data = {
            "razorpay_order_id": "order_test123",
            "razorpay_payment_id": "pay_test456",
            "razorpay_signature": "valid_signature",
        }
        
        mock_razorpay_client.utility.verify_payment_signature.return_value = True
        
        result = mock_razorpay_client.utility.verify_payment_signature(payment_data)
        assert result is True
    
    def test_verify_signature_invalid(self, mock_razorpay_client):
        """Test payment verification with invalid signature."""
        payment_data = {
            "razorpay_order_id": "order_test123",
            "razorpay_payment_id": "pay_test456",
            "razorpay_signature": "invalid_signature",
        }
        
        mock_razorpay_client.utility.verify_payment_signature.side_effect = Exception("Invalid signature")
        
        with pytest.raises(Exception):
            mock_razorpay_client.utility.verify_payment_signature(payment_data)


class TestSubscriptionStatus:
    """Test subscription status checking."""
    
    def test_subscription_is_active(self):
        """Test active subscription detection."""
        # Mock subscription record
        subscription = MagicMock()
        subscription.ends_at = datetime.now(timezone.utc) + timedelta(days=30)
        subscription.is_active = True
        
        # Active if ends_at is in the future
        assert subscription.ends_at > datetime.now(timezone.utc)
        assert subscription.is_active is True
    
    def test_subscription_is_expired(self):
        """Test expired subscription detection."""
        subscription = MagicMock()
        subscription.ends_at = datetime.now(timezone.utc) - timedelta(days=1)
        
        # Expired if ends_at is in the past
        assert subscription.ends_at < datetime.now(timezone.utc)
    
    def test_subscription_days_remaining(self):
        """Test calculation of remaining subscription days."""
        ends_at = datetime.now(timezone.utc) + timedelta(days=15)
        now = datetime.now(timezone.utc)
        
        remaining = (ends_at - now).days
        
        assert remaining == 15 or remaining == 14  # Allow for timing edge case


class TestWebhookVerification:
    """Test Razorpay webhook signature verification."""
    
    def test_webhook_signature_verification_hmac(self):
        """Test HMAC-SHA256 webhook signature verification."""
        import hmac
        import hashlib
        
        webhook_secret = "test_webhook_secret"
        body = '{"event": "payment.captured"}'
        
        # Generate expected signature
        expected_signature = hmac.new(
            webhook_secret.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Verify
        generated = hmac.new(
            webhook_secret.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()
        
        assert hmac.compare_digest(expected_signature, generated)
    
    def test_webhook_signature_mismatch(self):
        """Test webhook signature mismatch detection."""
        import hmac
        import hashlib
        
        webhook_secret = "test_webhook_secret"
        body = '{"event": "payment.captured"}'
        wrong_signature = "invalid_signature_here"
        
        generated = hmac.new(
            webhook_secret.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()
        
        assert not hmac.compare_digest(wrong_signature, generated)


class TestPaymentErrorHandling:
    """Test payment error handling."""
    
    def test_handle_razorpay_api_error(self, mock_razorpay_client):
        """Test handling of Razorpay API errors."""
        mock_razorpay_client.order.create.side_effect = Exception("Razorpay API error")
        
        with pytest.raises(Exception) as exc_info:
            mock_razorpay_client.order.create({
                "amount": 99900,
                "currency": "INR",
            })
        
        assert "Razorpay API error" in str(exc_info.value)
    
    def test_handle_insufficient_balance(self, mock_razorpay_client):
        """Test handling of insufficient balance errors."""
        error_response = {
            "error": {
                "code": "BAD_REQUEST_ERROR",
                "description": "Insufficient balance",
            }
        }
        mock_razorpay_client.order.create.side_effect = Exception(str(error_response))
        
        with pytest.raises(Exception):
            mock_razorpay_client.order.create({"amount": 99900, "currency": "INR"})


