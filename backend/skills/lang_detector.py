# [Spec]: specs/features/multilang.md
# Language Detection Skill - Reusable Intelligence

"""
LangDetectorSkill: Detects user language (Urdu/English) from input text.
Used by: Chat Agent, Task Creation, Voice Input
"""

import re
from typing import Literal


class LangDetectorSkill:
    """
    Detects language from text input.
    Supports: Urdu (ur), English (en)
    """
    
    # Urdu Unicode range
    URDU_PATTERN = re.compile(r'[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]')
    
    @classmethod
    def detect(cls, text: str) -> Literal["ur", "en"]:
        """
        Detect language from text.
        
        Args:
            text: Input text to analyze
            
        Returns:
            "ur" for Urdu, "en" for English
        """
        if not text or not text.strip():
            return "en"
        
        # Count Urdu characters
        urdu_chars = len(cls.URDU_PATTERN.findall(text))
        total_chars = len(text.replace(" ", ""))
        
        if total_chars == 0:
            return "en"
        
        # If more than 30% Urdu characters, consider it Urdu
        urdu_ratio = urdu_chars / total_chars
        return "ur" if urdu_ratio > 0.3 else "en"
    
    @classmethod
    def is_urdu(cls, text: str) -> bool:
        """Check if text is primarily Urdu."""
        return cls.detect(text) == "ur"
    
    @classmethod
    def is_english(cls, text: str) -> bool:
        """Check if text is primarily English."""
        return cls.detect(text) == "en"
    
    @classmethod
    def get_rtl_direction(cls, text: str) -> str:
        """Get text direction for CSS."""
        return "rtl" if cls.is_urdu(text) else "ltr"


# Export for direct import
detect_language = LangDetectorSkill.detect
