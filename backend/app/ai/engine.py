
import logging
import asyncio
from typing import Tuple, Optional
from openai import AsyncOpenAI
import google.generativeai as genai
from ..config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# ============================================================================
# PROVIDER CONFIGURATION
# ============================================================================

# Provider 1: OpenRouter (Llama 3.3)
openrouter_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.open_router_key,
    default_headers={
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "TodoEvolve"
    }
) if settings.open_router_key else None

# Updated Model List - Prioritizing reliable standard models over free tier
OPENROUTER_MODELS = [
    "meta-llama/llama-3.3-70b-instruct",      # High performance, actively supported
    "google/gemini-2.0-flash-001",            # Fast, reliable
    "mistralai/mistral-large-2411",           # Strong alternative
    "openai/gpt-4o-mini",                     # Verified fallback
]

# Provider 2: Gemini Direct
if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)
    # Using verified working model
    gemini_model = genai.GenerativeModel("gemini-1.5-flash")
else:
    gemini_model = None

# ============================================================================
# CHAT FUNCTIONS
# ============================================================================

async def call_openrouter(messages: list) -> Tuple[str, str]:
    """Call OpenRouter API, trying multiple models."""
    if not openrouter_client:
        raise Exception("OpenRouter not configured")
    
    last_error = None
    for model in OPENROUTER_MODELS:
        try:
            logger.info(f"Trying OpenRouter model: {model}")
            response = await openrouter_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7
            )
            content = response.choices[0].message.content
            model_short = model.split('/')[1].split(':')[0]
            logger.info(f"Success with {model}")
            return content, f"openrouter/{model_short}"
        except Exception as e:
            logger.warning(f"OpenRouter model {model} failed: {e}")
            last_error = e
            continue
    
    raise last_error or Exception("All OpenRouter models failed")


async def call_gemini(messages: list) -> Tuple[str, str]:
    """Call Gemini API directly."""
    if not gemini_model:
        raise Exception("Gemini not configured")
    
    # Convert OpenAI format to Gemini format
    prompt_parts = []
    for msg in messages:
        role = msg.get("role")
        content = msg.get("content")
        if role == "system":
            prompt_parts.append(f"System Instructions:\n{content}\n")
        elif role == "user":
            prompt_parts.append(f"User: {content}\n")
        elif role == "assistant":
            prompt_parts.append(f"Assistant: {content}\n")
    
    prompt_parts.append("Assistant:")
    full_prompt = "\n".join(prompt_parts)
    
    # Gemini API call
    try:
        response = await asyncio.to_thread(
            gemini_model.generate_content,
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=2048
            )
        )
        return response.text, "gemini/1.5-flash"
    except Exception as e:
        logger.error(f"Gemini API failed: {e}")
        raise e


async def dual_provider_chat(messages: list, max_retries: int = 2) -> Tuple[str, str]:
    """
    Attempt chat with OpenRouter first, fallback to Gemini on failure.
    Returns (response_text, provider_used).
    """
    providers = [
        ("OpenRouter", call_openrouter),
        ("Gemini", call_gemini),
    ]
    
    last_error = None
    
    for provider_name, provider_func in providers:
        for attempt in range(max_retries):
            try:
                content, model_id = await provider_func(messages)
                return content, model_id
                
            except Exception as e:
                error_str = str(e).lower()
                last_error = e
                logger.warning(f"{provider_name} attempt {attempt+1} failed: {e}")
                
                if "429" in str(e) or "rate" in error_str or "quota" in error_str:
                    logger.info(f"Rate limit detected on {provider_name}, switching provider...")
                    break
                
                if attempt < max_retries - 1:
                    await asyncio.sleep(1 * (attempt + 1))
    
    logger.error(f"All AI providers failed. Last error: {last_error}")
    
    return (
        "I'm currently experiencing high demand on my AI services. Please try again in a few minutes.",
        "fallback"
    )


def extract_json(text: str) -> Optional[dict]:
    """Attempt to extract JSON from text, handling markdown and mixed content."""
    import json
    import re
    
    # 1. Try parsing the whole text
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. Extract from Markdown code blocks
    try:
        if "```json" in text:
            block = text.split("```json")[1].split("```")[0].strip()
            return json.loads(block)
        elif "```" in text:
            block = text.split("```")[1].split("```")[0].strip()
            return json.loads(block)
    except Exception:
        pass
        
    # 3. Regex search for JSON object
    # This regex looks for the outermost curly braces
    try:
        match = re.search(r'(\{.*\})', text, re.DOTALL)
        if match:
            json_str = match.group(1)
            return json.loads(json_str)
    except Exception:
        pass

    return None

