import httpx
import asyncio

async def main():
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get("https://openrouter.ai/api/v1/models")
            data = resp.json()
            found = False
            print("--- Valid Gemini Free Models ---")
            for m in data['data']:
                if "gemini" in m['id'].lower() and "free" in m['id'].lower():
                    print(m['id'])
                    found = True
            
            print("--- Valid DeepSeek Free Models ---")
            for m in data['data']:
                if "deepseek" in m['id'].lower() and "free" in m['id'].lower():
                    print(m['id'])
                    found = True

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
