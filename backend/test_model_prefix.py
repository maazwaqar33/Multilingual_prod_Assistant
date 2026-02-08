
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)

candidates = ["gemini-2.0-flash", "models/gemini-2.0-flash"]

for name in candidates:
    print(f"Testing {name}...")
    try:
        model = genai.GenerativeModel(name)
        response = model.generate_content("Hi")
        print(f"SUCCESS with {name}")
        print(f"Response: {response.text}")
        break
    except Exception as e:
        print(f"FAIL with {name}: {e}")
