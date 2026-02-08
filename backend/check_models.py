
import asyncio
import os
import google.generativeai as genai
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

async def check_gemini():
    print("\n--- Checking Gemini ---")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY not found.")
        return

    genai.configure(api_key=api_key)
    try:
        print("Listing available Gemini models:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
        
        # Test generation with a safe default
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello")
        print(f"Test generation (gemini-1.5-flash): Success - {response.text[:20]}...")
    except Exception as e:
        print(f"Gemini Error: {e}")

async def check_openrouter():
    print("\n--- Checking OpenRouter ---")
    api_key = os.getenv("OPEN_ROUTER_KEY")
    if not api_key:
        print("OPEN_ROUTER_KEY not found.")
        return

    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
        default_headers={"HTTP-Referer": "http://localhost:3000", "X-Title": "TodoEvolve Test"}
    )
    
    # Test standard Llama 3.3 (Paid/Credit based)
    model = "meta-llama/llama-3.3-70b-instruct"
    print(f"Testing {model}...")
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Hello"}],
        )
        print(f"Success: {response.choices[0].message.content[:20]}...")
    except Exception as e:
        print(f"Error testing {model}: {e}")

async def main():
    await check_gemini()
    await check_openrouter()

if __name__ == "__main__":
    asyncio.run(main())
