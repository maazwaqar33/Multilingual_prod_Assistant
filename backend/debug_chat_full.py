
import asyncio
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI
import json

# Mock MCP Server import logic (since we can't easily import app.ai.mcp_server due to relative imports)
# We will copy the critical logic here to replicate the environment exactly

from mcp.types import Tool

# 1. Define Tools (Copy from mcp_server.py)
tools = [
    Tool(name="add_task", description="Create a new task", inputSchema={"type": "object", "properties": {"title": {"type": "string"}}, "required": ["title"]}),
    Tool(name="list_tasks", description="List current tasks", inputSchema={"type": "object", "properties": {"status": {"type": "string"}}, "required": []}),
    Tool(name="complete_task", description="Mark a task as complete", inputSchema={"type": "object", "properties": {"task_id": {"type": "integer"}}, "required": ["task_id"]}),
    Tool(name="delete_task", description="Delete a task", inputSchema={"type": "object", "properties": {"task_id": {"type": "integer"}}, "required": ["task_id"]}),
    Tool(name="update_task", description="Update a task", inputSchema={"type": "object", "properties": {"task_id": {"type": "integer"}}, "required": ["task_id"]})
]

def get_tool_definitions(tools):
    defs = []
    for t in tools:
        defs.append(f"Tool: {t.name}")
        defs.append(f"Description: {t.description}")
        defs.append(f"Input Schema: {json.dumps(t.inputSchema)}")
        defs.append("---")
    return "\n".join(defs)

SYSTEM_PROMPT_TEMPLATE = """You are TodoEvolve, a smart, productivity-focused AI assistant.
Your goal is to help users manage their tasks efficiently.
You are concise, friendly, and action-oriented.

You have access to the following tools:
{tool_definitions}

To use a tool, you MUST reply with a valid JSON object in the following format:
{{
    "tool": "tool_name",
    "arguments": {{
        "arg1": "value1"
    }}
}}

If you do NOT want to use a tool, just reply with your message normally.
Do not output JSON unless you are calling a tool.
If you call a tool, outputs ONLY the JSON, nothing else.

Current Context:
User ID: user_123
Language: en
"""

load_dotenv()
client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPEN_ROUTER_KEY")
)

MODEL_NAME = "google/gemma-3-27b-it:free"

async def test():
    print(f"Testing Model: {MODEL_NAME}")
    
    tool_defs = get_tool_definitions(tools)
    system_instruction = SYSTEM_PROMPT_TEMPLATE.format(tool_definitions=tool_defs)
    
    messages = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": "Create a task called 'Debug Test'"}
    ]
    
    print("Sending Request...")
    try:
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            # temperature=0.7,
        )
        print("Response received!")
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
