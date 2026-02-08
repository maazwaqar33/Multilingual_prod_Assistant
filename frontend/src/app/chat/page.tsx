"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceInput } from '@/components/ui/VoiceInput';
import { AIThinking } from '@/components/ui/AIThinking';
import { LangToggle } from '@/components/ui/LangToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function ChatPage() {
    const { t, language } = useApp();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: language === 'ur'
                ? 'السلام علیکم! میں TodoEvolve AI ہوں۔ آج آپ کے ٹاسک میں کیسے مدد کر سکتا ہوں؟'
                : 'Hello! I am TodoEvolve AI. How can I help you manage your tasks today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            const res = await fetch(`${API_BASE}/chat/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.content, language })
            });

            if (!res.ok) throw new Error('Failed to fetch response');

            const data = await res.json();
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: language === 'ur'
                    ? 'معذرت، ابھی جواب نہیں ملا۔ دوبارہ کوشش کریں۔'
                    : 'Sorry, I\'m having trouble right now. Please try again in a moment.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleVoiceTranscript = (text: string) => {
        setInput(prev => prev ? `${prev} ${text}` : text);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/80 backdrop-blur-lg p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">TodoEvolve AI</h1>
                            <p className="text-xs text-muted-foreground">
                                {language === 'ur' ? 'آپ کا ذاتی پروڈکٹیویٹی اسسٹنٹ' : 'Your personal productivity assistant'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <LangToggle />
                    <ThemeToggle />
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex gap-3 max-w-[85%] animate-float-in",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                            msg.role === 'user'
                                ? "bg-gradient-to-br from-primary to-purple-500 text-white"
                                : "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                        )}>
                            {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                        </div>

                        <div className={cn(
                            "rounded-2xl px-5 py-3 shadow-sm",
                            msg.role === 'user'
                                ? "bg-gradient-to-br from-primary to-purple-500 text-white rounded-tr-md"
                                : "bg-card border rounded-tl-md"
                        )}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            <p className={cn(
                                "text-xs mt-2",
                                msg.role === 'user' ? "text-white/60" : "text-muted-foreground"
                            )}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}

                {/* AI Thinking Indicator */}
                {isThinking && (
                    <div className="max-w-[85%]">
                        <AIThinking message={t('ai.thinking')} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-card/80 backdrop-blur-lg shrink-0">
                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                    <VoiceInput onTranscript={handleVoiceTranscript} />

                    <div className="flex-1 flex items-center gap-2 bg-muted rounded-2xl px-4 py-3 border-2 border-transparent focus-within:border-primary transition-all">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder={t('chat.placeholder')}
                            className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm"
                            dir={language === 'ur' ? 'rtl' : 'ltr'}
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        className="p-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg hover:shadow-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
