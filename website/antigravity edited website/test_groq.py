import os
from groq import Groq
import base64

key = "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"
client = Groq(api_key=key)

# 1x1 Red pixel
image_data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

try:
    print("Testing Vision Model (meta-llama/llama-4-scout-17b-16e-instruct)...")
    completion = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "What is in this image?"},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_data}"}}
                ]
            }
        ],
        temperature=1,
        max_tokens=1024,
        top_p=1,
        stream=False,
        stop=None,
    )
    print(f"Vision Response: {completion.choices[0].message.content}")

    # Also test Text model
    print("\nTesting Text Model (llama-3.1-70b-versatile)...")
    text_comp = client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[{"role": "user", "content": "Say hello."}]
    )
    print(f"Text Response: {text_comp.choices[0].message.content}")

except Exception as e:
    print(f"Error: {e}")
