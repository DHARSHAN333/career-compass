import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

print("Available Gemini models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"  {m.name}")

# Test with gemini-2.5-flash
print("\nTesting Gemini API...")
model = genai.GenerativeModel('gemini-2.5-flash')
response = model.generate_content('Say hello in one sentence')
print(f"Response: {response.text}")
