import os
from groq import Groq

key = "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"
client = Groq(api_key=key)

try:
    models = client.models.list()
    print("Available Models:")
    for m in models.data:
        print(f"- {m.id}")
except Exception as e:
    print(f"Error: {e}")
