"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface AIThinkingProps {
    message?: string;
    className?: string;
}

export function AIThinking({ message = "AI is thinking...", className }: AIThinkingProps) {
    return (
        <div className={cn("flex items-center gap-3 p-4 rounded-xl bg-muted/50", className)}>
            <div className="relative">
                {/* Animated brain/sparkle icon */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                    <svg
                        className="w-5 h-5 text-white animate-pulse"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                    </svg>
                </div>

                {/* Rotating ring */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
            </div>

            <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{message}</p>
                <div className="thinking-dots mt-1">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
}
