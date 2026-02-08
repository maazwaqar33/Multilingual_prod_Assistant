"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type Language = 'en' | 'ur';

interface AppContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDark: boolean;
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        'greeting': 'Good Morning',
        'greeting.afternoon': 'Good Afternoon',
        'greeting.evening': 'Good Evening',
        'greeting.subtitle': 'What do you want to achieve today?',
        'tasks.my': 'My Tasks',
        'tasks.pending': 'pending',
        'tasks.completed': 'completed',
        'tasks.add': 'Add a new task...',
        'tasks.title': 'What needs to be done?',
        'tasks.description': 'Description (optional)',
        'tasks.priority': 'Priority',
        'tasks.tags': 'Tags (comma separated)',
        'tasks.submit': 'Add Task',
        'tasks.cancel': 'Cancel',
        'priority.high': 'High',
        'priority.medium': 'Medium',
        'priority.low': 'Low',
        'ai.insights': 'AI Insights',
        'ai.thinking': 'AI is thinking...',
        'ai.suggestion': 'Suggested action',
        'voice.start': 'Start voice input',
        'voice.stop': 'Stop recording',
        'voice.listening': 'Listening...',
        'chat.placeholder': 'Ask AI to help with your tasks...',
        'chat.send': 'Send',
        'error.backend': 'Could not connect to backend. Ensure FastAPI is running on port 8000.',
    },
    ur: {
        'greeting': 'صبح بخیر',
        'greeting.afternoon': 'سہ پہر بخیر',
        'greeting.evening': 'شام بخیر',
        'greeting.subtitle': 'آج آپ کیا حاصل کرنا چاہتے ہیں؟',
        'tasks.my': 'میرے ٹاسک',
        'tasks.pending': 'باقی',
        'tasks.completed': 'مکمل',
        'tasks.add': 'نیا ٹاسک شامل کریں...',
        'tasks.title': 'کیا کرنا ہے؟',
        'tasks.description': 'تفصیل (اختیاری)',
        'tasks.priority': 'ترجیح',
        'tasks.tags': 'ٹیگز (کوما سے الگ)',
        'tasks.submit': 'ٹاسک شامل کریں',
        'tasks.cancel': 'منسوخ',
        'priority.high': 'اعلی',
        'priority.medium': 'درمیانی',
        'priority.low': 'کم',
        'ai.insights': 'AI بصیرت',
        'ai.thinking': 'AI سوچ رہا ہے...',
        'ai.suggestion': 'تجویز کردہ عمل',
        'voice.start': 'آواز کی ان پٹ شروع کریں',
        'voice.stop': 'ریکارڈنگ بند کریں',
        'voice.listening': 'سن رہا ہے...',
        'chat.placeholder': 'AI سے اپنے ٹاسک میں مدد لیں...',
        'chat.send': 'بھیجیں',
        'error.backend': 'بیک اینڈ سے کنیکٹ نہیں ہو سکا۔ یقینی بنائیں کہ FastAPI پورٹ 8000 پر چل رہا ہے۔',
    }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [isDark, setIsDark] = useState(false);
    const [language, setLanguageState] = useState<Language>('en');

    // Initialize theme from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme | null;
        if (stored) {
            setThemeState(stored);
        }
        const storedLang = localStorage.getItem('language') as Language | null;
        if (storedLang) {
            setLanguageState(storedLang);
        }
    }, []);

    // Apply theme
    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'system') {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(systemDark);
            root.classList.toggle('dark', systemDark);
        } else {
            setIsDark(theme === 'dark');
            root.classList.toggle('dark', theme === 'dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    // Apply language direction
    useEffect(() => {
        document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        localStorage.setItem('language', language);
    }, [language]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <AppContext.Provider value={{ theme, setTheme, isDark, language, setLanguage, t }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}
