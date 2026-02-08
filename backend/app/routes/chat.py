# [Spec]: specs/api/rest-endpoints.md
# TodoEvolve Backend - Chat Router (Dual Provider: OpenRouter + Gemini)

"""
AI Chat endpoint with intelligent fallback between OpenRouter and Gemini.
Handles rate limits gracefully by switching providers.
"""

import json
import logging
import traceback
import asyncio
from typing import Optional, Tuple, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, delete
from pydantic import BaseModel

from ..database import get_session
from ..auth import get_current_user
from ..config import get_settings
from ..models import ChatMessage
from ..schemas import ChatMessageResponse
from ..ai.mcp_server import list_tools, handle_tool_call, get_tool_definitions
from ..ai.engine import dual_provider_chat, extract_json

router = APIRouter(prefix="/chat", tags=["chat"])
settings = get_settings()

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================================================
# SYSTEM PROMPT
# ============================================================================

SYSTEM_PROMPT_TEMPLATE = """You are TodoEvolve, a smart, productivity-focused AI assistant.
Your goal is to help users manage their tasks efficiently using the available tools.

You have access to:
{tool_definitions}

### RULES:
1. **Always use tools** to perform actions. Do not just say you did it.
2. **Context Awareness**: To act on specific tasks (delete/complete/update), first call `list_tasks` to find their IDs. Then, in the NEXT turn, use `bulk_delete_tasks` or `bulk_complete_tasks` to perform the action on all identified tasks at once. Do NOT guess IDs.
3. **Format**: To call a tool, reply with JUST the JSON object:
{{
    "tool": "tool_name",
    "arguments": {{ ... }}
}}
4. If asked about weather, use `get_weather`.
5. If the user asks to "Plan my day" or generate a schedule, use `plan_day`.
6. Be concise and helpful.
7. **Natural Language**: When listing tasks or plans, use natural language (e.g., "Meeting at 2 PM"). NEVER show internal IDs (like "ID: 109") to the user unless explicitly asked for debugging. Keep IDs internal for tool use only.

Current Context:
User ID: {user_id}
Language: {language}
"""


# ============================================================================
# REQUEST MODEL
# ============================================================================

class ChatRequest(BaseModel):
    message: str
    language: str = "en"


# ============================================================================
# CHAT ENDPOINT
# ============================================================================

@router.get("/history", response_model=list[ChatMessageResponse])
async def get_chat_history(
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get chat history for the current user."""
    query = select(ChatMessage).where(ChatMessage.user_id == current_user).order_by(ChatMessage.created_at)
    return session.exec(query).all()


@router.delete("/history")
async def clear_chat_history(
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Clear chat history for the current user."""
    statement = delete(ChatMessage).where(ChatMessage.user_id == current_user)
    session.exec(statement)
    session.commit()
    return {"message": "Chat history cleared"}


@router.post("/")
async def chat_endpoint(
    request: ChatRequest,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Chat with the AI using dual provider fallback.
    Tries OpenRouter first, falls back to Gemini on rate limit.
    """
    # 0. Save User Message
    user_msg = ChatMessage(user_id=current_user, role="user", content=request.message)
    session.add(user_msg)
    session.commit()

    try:
        # 1. Prepare Tools
        tools = await list_tools()
        tool_defs = get_tool_definitions(tools)
        
        # 2. Prepare System Prompt
        system_instruction = SYSTEM_PROMPT_TEMPLATE.format(
            tool_definitions=tool_defs,
            user_id=current_user,
            language=request.language
        )
        
        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": request.message}
        ]
        
        MAX_TURNS = 10 # Increased from 5 to allow complex multi-step actions (List -> Bulk Delete)
        turn_count = 0
        action_performed = False
        last_tool_name = None
        used_model = None
        
        while turn_count < MAX_TURNS:
            turn_count += 1
            logger.info(f"Turn {turn_count}: Sending request to AI...")
            
            # 3. Call AI with Dual Provider Fallback
            ai_message, used_model = await dual_provider_chat(messages)
            logger.info(f"AI Response ({used_model}): {ai_message[:100]}...")

            # 4. Check for Tool Call (JSON)
            tool_call_data = extract_json(ai_message)
            
            if not tool_call_data:
                # No tool call = Final Text Response
                # Save Assistant Response
                ai_msg = ChatMessage(user_id=current_user, role="assistant", content=ai_message)
                session.add(ai_msg)
                session.commit()
                
                return {
                    "response": ai_message,
                    "action_performed": action_performed,
                    "tool": last_tool_name,
                    "model": used_model
                }
            
            # Tool Detected
            tool_name = tool_call_data.get("tool")
            tool_args = tool_call_data.get("arguments", {})
            
            logger.info(f"Executing Tool: {tool_name}")
            
            # Execute Tool (Uses shared session and user_id)
            tool_result = await handle_tool_call(tool_name, tool_args, current_user, session)
            action_performed = True
            last_tool_name = tool_name
            
            # Append Interaction to History
            messages.append({"role": "assistant", "content": ai_message})
            messages.append({"role": "user", "content": f"Tool Output: {json.dumps(tool_result, default=str)}"})
            
            # Loop continues...
        
        return {
            "response": "Done! I've completed all the requested actions. Let me know if you need anything else!",
            "action_performed": True,
            "tool": last_tool_name,
            "model": used_model
        }

    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        logger.error(traceback.format_exc())
        return {"response": "Sorry, I encountered an error. Please try again."}
