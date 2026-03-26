"""
Email Service for transactional emails
Uses SMTP or configurable backend for sending password reset, verification emails
"""
import os
import secrets
import smtplib
from datetime import UTC, datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from loguru import logger

# Email Configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER or "noreply@aibodyscan.com")
APP_URL = os.getenv("APP_URL", "http://localhost:3000")


def generate_token() -> str:
    """Generate a secure random token."""
    return secrets.token_urlsafe(32)


def send_email(to: str, subject: str, html_body: str) -> bool:
    """
    Send an email via SMTP.
    Returns True if sent, False if SMTP not configured or failed.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning(f"SMTP not configured. Would have sent email to {to}: {subject}")
        logger.info(f"Email body preview: {html_body[:200]}...")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = FROM_EMAIL
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to, msg.as_string())

        logger.info(f"Email sent to {to}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False


def send_password_reset_email(email: str, token: str) -> bool:
    """Send password reset email with reset link."""
    reset_url = f"{APP_URL}/reset-password?token={token}"

    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #1e1b4b, #0f172a); border-radius: 20px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">✨</div>
            <h1 style="color: #fff; font-size: 24px; margin: 0 0 10px;">Reset Your Password</h1>
            <p style="color: #94a3b8; font-size: 14px; margin: 0 0 30px; line-height: 1.6;">
                We received a request to reset your BodyScan AI password. Click the button below to set a new password.
            </p>
            <a href="{reset_url}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #A855F7); color: #fff; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Reset Password
            </a>
            <p style="color: #64748b; font-size: 12px; margin-top: 30px; line-height: 1.5;">
                This link expires in 1 hour. If you didn't request this, ignore this email.
            </p>
        </div>
        <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 20px;">
            BodyScan AI &bull; AI-Powered Body Intelligence
        </p>
    </div>
    """

    return send_email(email, "Reset your BodyScan AI password", html)


def send_verification_email(email: str, token: str) -> bool:
    """Send email verification link after signup."""
    verify_url = f"{APP_URL}/verify-email?token={token}"

    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #1e1b4b, #0f172a); border-radius: 20px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
            <h1 style="color: #fff; font-size: 24px; margin: 0 0 10px;">Verify Your Email</h1>
            <p style="color: #94a3b8; font-size: 14px; margin: 0 0 30px; line-height: 1.6;">
                Welcome to BodyScan AI! Please verify your email address to unlock all features.
            </p>
            <a href="{verify_url}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #059669); color: #fff; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Verify Email
            </a>
            <p style="color: #64748b; font-size: 12px; margin-top: 30px; line-height: 1.5;">
                This link expires in 24 hours. If you didn't create this account, ignore this email.
            </p>
        </div>
        <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 20px;">
            BodyScan AI &bull; AI-Powered Body Intelligence
        </p>
    </div>
    """

    return send_email(email, "Verify your BodyScan AI email", html)


def send_payment_receipt_email(
    email: str,
    user_name: str,
    amount: float,
    plan_name: str,
    payment_id: str,
    invoice_number: str,
    valid_until: str,
) -> bool:
    """Send payment receipt / subscription confirmation email."""
    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #1e1b4b, #0f172a); border-radius: 20px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
            <h1 style="color: #fff; font-size: 24px; margin: 0 0 6px;">Payment Successful!</h1>
            <p style="color: #a78bfa; font-size: 14px; margin: 0 0 30px;">
                Welcome to <strong>{plan_name}</strong>, {user_name}!
            </p>

            <!-- Receipt Card -->
            <div style="background: rgba(255,255,255,0.06); border-radius: 14px; padding: 24px; text-align: left; margin-bottom: 28px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="color: #94a3b8; font-size: 13px; padding: 8px 0;">Plan</td>
                        <td style="color: #fff; font-size: 13px; padding: 8px 0; text-align: right; font-weight: 600;">{plan_name}</td>
                    </tr>
                    <tr>
                        <td style="color: #94a3b8; font-size: 13px; padding: 8px 0;">Amount Paid</td>
                        <td style="color: #10b981; font-size: 13px; padding: 8px 0; text-align: right; font-weight: 600;">₹{amount:.2f}</td>
                    </tr>
                    <tr>
                        <td style="color: #94a3b8; font-size: 13px; padding: 8px 0;">Invoice</td>
                        <td style="color: #fff; font-size: 13px; padding: 8px 0; text-align: right; font-family: monospace;">{invoice_number}</td>
                    </tr>
                    <tr>
                        <td style="color: #94a3b8; font-size: 13px; padding: 8px 0;">Payment ID</td>
                        <td style="color: #fff; font-size: 13px; padding: 8px 0; text-align: right; font-family: monospace; word-break: break-all;">{payment_id}</td>
                    </tr>
                    <tr style="border-top: 1px solid rgba(255,255,255,0.1);">
                        <td style="color: #94a3b8; font-size: 13px; padding: 12px 0 0;">Valid Until</td>
                        <td style="color: #fbbf24; font-size: 13px; padding: 12px 0 0; text-align: right; font-weight: 600;">{valid_until}</td>
                    </tr>
                </table>
            </div>

            <a href="{APP_URL}/profile" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #A855F7); color: #fff; padding: 14px 36px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Manage Subscription
            </a>

            <p style="color: #64748b; font-size: 11px; margin-top: 28px; line-height: 1.5;">
                This is your official payment receipt. Save this email for your records.<br>
                Questions? Reply to this email or contact aibodyscan123@gmail.com
            </p>
        </div>
        <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 20px;">
            BodyScan AI &bull; AI-Powered Body Intelligence
        </p>
    </div>
    """

    return send_email(email, f"🧾 Payment Receipt — {plan_name} | BodyScan AI", html)
