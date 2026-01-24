import google.generativeai as genai
import os

key = "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"

try:
    genai.configure(api_key=key)
    model = genai.GenerativeModel('gemini-2.5-flash-lite')
    response = model.generate_content("Hello, check validity.")
    print(f"Success! Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
