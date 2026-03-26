"""
WhatsApp Test Script
Test your WhatsApp integration using the hello_world template
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Load environment variables from .env file
from dotenv import load_dotenv

env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

from loguru import logger

from integrations.whatsapp_service import whatsapp_service


def test_whatsapp_hello_world(phone_number: str):
    """
    Test WhatsApp integration using hello_world template
    
    Args:
        phone_number: User's phone number (with country code)
    """
    logger.info(f"Testing WhatsApp with hello_world template to {phone_number}")

    if not whatsapp_service.access_token or not whatsapp_service.phone_number_id:
        logger.error("WhatsApp not configured. Check .env file.")
        return False

    try:
        import requests

        # Format phone number
        formatted_phone = whatsapp_service.format_phone_number(phone_number)

        # Prepare hello_world template message
        payload = {
            "messaging_product": "whatsapp",
            "to": formatted_phone,
            "type": "template",
            "template": {
                "name": "hello_world",
                "language": {
                    "code": "en_US"
                }
            }
        }

        headers = {
            "Authorization": f"Bearer {whatsapp_service.access_token}",
            "Content-Type": "application/json"
        }

        # Send request
        response = requests.post(
            whatsapp_service.api_url,
            json=payload,
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            message_id = data.get('messages', [{}])[0].get('id')
            logger.info("✅ WhatsApp test message sent successfully!")
            logger.info(f"📱 Message ID: {message_id}")
            logger.info(f"📞 Sent to: {formatted_phone}")
            print("\n" + "="*50)
            print("✅ SUCCESS! Check your WhatsApp for the message!")
            print("="*50 + "\n")
            return True
        else:
            error_data = response.json()
            error_msg = error_data.get('error', {}).get('message', 'Unknown error')
            logger.error(f"❌ WhatsApp API error: {response.status_code} - {error_msg}")
            print("\n" + "="*50)
            print(f"❌ FAILED: {error_msg}")
            print("="*50 + "\n")
            return False

    except Exception as e:
        logger.error(f"WhatsApp test error: {e!s}")
        print("\n" + "="*50)
        print(f"❌ ERROR: {e!s}")
        print("="*50 + "\n")
        return False


if __name__ == "__main__":
    print("\n" + "="*50)
    print("WhatsApp Integration Test")
    print("="*50 + "\n")

    # Get phone number from user
    phone = input("Enter your WhatsApp number (with country code, e.g., +919876543210): ").strip()

    if not phone:
        print("❌ Phone number required!")
        sys.exit(1)

    # Run test
    success = test_whatsapp_hello_world(phone)

    if success:
        print("✅ WhatsApp integration is working!")
        print("⏳ Once 'bodyscan' template is approved, payment receipts will work automatically!")
    else:
        print("❌ WhatsApp integration failed. Check the error above.")
        print("\nTroubleshooting:")
        print("1. Verify your access token in .env")
        print("2. Check if phone_number_id is correct")
        print("3. Ensure phone number format is correct (+[country][number])")

