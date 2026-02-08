
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)

name = "gemini-1.5-flash"
print(f"Testing {name}...")
try:
    model = genai.GenerativeModel(name)
    response = model.generate_content("Hi")
    print(f"SUCCESS with {name}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"FAIL with {name}: {e}")
