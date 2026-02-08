"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export function LangToggle() {
    const { language, setLanguage } = useApp();

    const toggleLang = () => {
        setLanguage(language === 'en' ? 'ur' : 'en');
    };

    return (
        <button
            onClick={toggleLang}
            className={cn(
                "px-3 py-2 rounded-xl transition-all duration-300",
                "bg-muted hover:bg-muted-foreground/10",
                "text-sm font-medium"
            )}
            title={language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
        >
            {language === 'en' ? (
                <span style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>اردو</span>
            ) : (
                <span>EN</span>
            )}
        </button>
    );
}
