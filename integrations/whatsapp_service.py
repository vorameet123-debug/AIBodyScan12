"""
WhatsApp Business API Integration
Sends automated messages for payment receipts, invoices, and notifications
"""
import os
from datetime import datetime

import requests
from loguru import logger


class WhatsAppService:
    """Service for sending WhatsApp messages via Meta Business API"""

    def __init__(self):
        self.access_token = os.getenv('WHATSAPP_ACCESS_TOKEN')
        self.phone_number_id = os.getenv('WHATSAPP_PHONE_NUMBER_ID')
        self.api_url = f"https://graph.facebook.com/v18.0/{self.phone_number_id}/messages"

        if not self.access_token or not self.phone_number_id:
            logger.warning("WhatsApp credentials not configured. Messages will not be sent.")

    def format_phone_number(self, phone: str) -> str:
        """Format phone number to international format without + or -"""
        # Remove all non-numeric characters
        phone = ''.join(filter(str.isdigit, phone))

        # Add country code if not present (assume India +91)
        if not phone.startswith('91') and len(phone) == 10:
            phone = '91' + phone

        return phone

    def send_payment_receipt(
        self,
        phone_number: str,
        user_name: str,
        amount: float,
        invoice_number: str,
        plan_name: str,
        valid_until: str
    ) -> dict:
        """
        Send payment receipt via WhatsApp
        
        Args:
            phone_number: User's phone number
            user_name: User's name
            amount: Payment amount
            invoice_number: Invoice/order ID
            plan_name: Subscription plan name
            valid_until: Subscription expiry date
            
        Returns:
            Dict with success status and message ID or error
        """
        if not self.access_token or not self.phone_number_id:
            logger.error("WhatsApp not configured. Skipping message.")
            return {"success": False, "error": "WhatsApp not configured"}

        try:
            # Format phone number
            formatted_phone = self.format_phone_number(phone_number)
            logger.info(f"Sending payment receipt to WhatsApp: {formatted_phone}")

            # Prepare message payload
            payload = {
                "messaging_product": "whatsapp",
                "to": formatted_phone,
                "type": "template",
                "template": {
                    "name": "bodyscan",  # Your approved template name
                    "language": {
                        "code": "en"
                    },
                    "components": [
                        {
                            "type": "body",
                            "parameters": [
                                {"type": "text", "text": user_name},
                                {"type": "text", "text": f"{amount}"},
                                {"type": "text", "text": invoice_number},
                                {"type": "text", "text": plan_name},
                                {"type": "text", "text": valid_until}
                            ]
                        }
                    ]
                }
            }

            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }

            # Send request
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                message_id = data.get('messages', [{}])[0].get('id')
                logger.info(f"✅ WhatsApp message sent successfully. Message ID: {message_id}")
                return {
                    "success": True,
                    "message_id": message_id,
                    "phone": formatted_phone
                }
            else:
                error_data = response.json()
                error_msg = error_data.get('error', {}).get('message', 'Unknown error')
                logger.error(f"❌ WhatsApp API error: {response.status_code} - {error_msg}")
                return {
                    "success": False,
                    "error": error_msg,
                    "status_code": response.status_code
                }

        except requests.Timeout:
            logger.error("WhatsApp API timeout")
            return {"success": False, "error": "Timeout"}
        except Exception as e:
            logger.error(f"WhatsApp send error: {e!s}")
            return {"success": False, "error": str(e)}

    def send_simple_message(self, phone_number: str, message: str) -> dict:
        """
        Send a simple text message (for testing, requires approved template in production)
        
        Note: In production, all messages must use approved templates
        This is only for development/testing with test numbers
        """
        if not self.access_token or not self.phone_number_id:
            return {"success": False, "error": "WhatsApp not configured"}

        try:
            formatted_phone = self.format_phone_number(phone_number)

            payload = {
                "messaging_product": "whatsapp",
                "to": formatted_phone,
                "type": "text",
                "text": {
                    "body": message
                }
            }

            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }

            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                return {"success": True, "data": data}
            else:
                return {"success": False, "error": response.json()}

        except Exception as e:
            logger.error(f"WhatsApp error: {e!s}")
            return {"success": False, "error": str(e)}


# Global instance
whatsapp_service = WhatsAppService()


def generate_invoice_number() -> str:
    """Generate unique invoice number"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f"INV-{timestamp}"

