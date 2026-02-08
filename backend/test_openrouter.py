
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPEN_ROUTER_KEY")
)

MODEL = "deepseek/deepseek-r1:free"

print(f"Testing {MODEL}...")
try:
    completion = client.chat.completions.create(
    model=MODEL,
    messages=[
        {
        "role": "user",
        "content": "Hello, are you online?"
        }
    ]
    )
    print(completion.choices[0].message.content)
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {e}")
