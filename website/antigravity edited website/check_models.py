import google.generativeai as genai
import os

api_key = "AIzaSyD0CFD1RTpXtIKDR7CIcZTfSL1eWUneNBo"
genai.configure(api_key=api_key)

print("Listing available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"Model: {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
