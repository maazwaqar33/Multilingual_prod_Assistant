
import asyncio
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI
import json

# Mock MCP Server import logic
from mcp.types import Tool

tools = [
    Tool(name="add_task", description="Create a new task", inputSchema={"type": "object", "properties": {"title": {"type": "string"}}, "required": ["title"]}),
]

def get_tool_definitions(tools):
    defs = []
    for t in tools:
        defs.append(f"Tool: {t.name}")
        defs.append(f"Description: {t.description}")
        defs.append(f"Input Schema: {json.dumps(t.inputSchema)}")
        defs.append("---")
    return "\n".join(defs)

SYSTEM_PROMPT_TEMPLATE = """You are TodoEvolve.
You have access to the following tools:
{tool_definitions}

To use a tool, you MUST reply with a valid JSON object:
{{ "tool": "tool_name", "arguments": {{ ... }} }}
"""

load_dotenv()
client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPEN_ROUTER_KEY")
)

MODEL_NAME = "meta-llama/llama-3.3-70b-instruct:free"

def extract_json(text: str):
    try:
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
             text = text.split("```")[1].split("```")[0].strip()
        return json.loads(text)
    except:
        return None

async def test():
    print(f"Testing Model: {MODEL_NAME}")
    
    tool_defs = get_tool_definitions(tools)
    system_instruction = SYSTEM_PROMPT_TEMPLATE.format(tool_definitions=tool_defs)
    
    messages = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": "Create a task called 'Debug Loop Task'"}
    ]
    
    print("Sending FIRST Request...")
    try:
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "TodoEvolve"
            }
        )
        ai_message = response.choices[0].message.content
        print(f"First Response: {ai_message}")
        
        tool_call_data = extract_json(ai_message)
        if tool_call_data:
            print(f"Tool Detected: {tool_call_data}")
            # Simulate Tool Execution
            tool_result = {"status": "success", "message": "Task created successfully"}
            
            # Prepare Second Call
            messages.append({"role": "assistant", "content": ai_message})
            messages.append({"role": "user", "content": f"Tool Output: {json.dumps(tool_result)}\n\nPlease acknowledge nicely."})
            
            print("Sending SECOND Request (Confirmation)...")
            final_response = await client.chat.completions.create(
                model=MODEL_NAME,
                messages=messages,
                extra_headers={
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "TodoEvolve"
                }
            )
            print("Final Response:", final_response.choices[0].message.content)
            
        else:
            print("No JSON detected in first response.")
            
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
