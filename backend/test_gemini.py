
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load .env explicitly
load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")
print(f"API Key found: {'Yes' if api_key else 'No'}")
if api_key:
    print(f"API Key length: {len(api_key)}")
    print(f"API Key prefix: {api_key[:4]}...")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    print("Attempting to generate content...")
    response = model.generate_content("Hello, can you hear me?")
    print("Success!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
