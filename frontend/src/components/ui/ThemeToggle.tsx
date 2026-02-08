"use client";

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
    const { isDark, setTheme } = useApp();

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                "bg-muted hover:bg-muted-foreground/10",
                "text-foreground"
            )}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {isDark ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </button>
    );
}
