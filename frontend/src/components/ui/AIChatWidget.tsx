"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceInput } from './VoiceInput';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface AIChatWidgetProps {
    onTaskAction?: () => void; // Callback to refresh tasks after AI action
}

const CHAT_STORAGE_KEY = 'todoevolve_chat_history';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function AIChatWidget({ onTaskAction }: AIChatWidgetProps) {
    const { language } = useApp();
    const { getAccessToken, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Load chat history from backend on mount
    useEffect(() => {
        const fetchHistory = async () => {
            if (!isAuthenticated) return;

            const token = getAccessToken();
            if (!token) return;

            try {
                const res = await fetch(`${API_BASE}/chat/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const history = data.map((msg: any) => ({
                            id: msg.id.toString(),
                            role: msg.role,
                            content: msg.content,
                            timestamp: new Date(msg.created_at).getTime()
                        }));
                        setMessages(history);
                        return;
                    }
                }
            } catch (err) {
                console.error('Failed to load chat history:', err);
            }

            // Fallback: Add welcome message if no history
            setMessages([{
                id: '1',
                role: 'assistant',
                content: language === 'ur'
                    ? 'السلام علیکم! میں آپ کے ٹاسک میں مدد کر سکتا ہوں۔'
                    : 'Hi! I can help you manage your tasks. Try: "Add a task to call mom" or "Show my tasks"',
                timestamp: Date.now()
            }]);
        };

        fetchHistory();
    }, [language, isAuthenticated, getAccessToken]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || isThinking) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            const token = getAccessToken();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_BASE}/chat/`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ message: userMsg.content, language })
            });

            // Try to parse response even on non-OK status - backend may send useful message
            const data = await res.json().catch(() => null);

            if (data && data.response) {
                // Got a response from backend (even if it's a rate limit message)
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.response,
                    timestamp: Date.now()
                }]);

                // Refresh tasks if AI performed an action (add, delete, complete, etc.)
                if (data.action_performed && onTaskAction) {
                    console.log('AI performed action, refreshing tasks...');
                    onTaskAction();
                }
            } else {
                // No valid response - show error
                throw new Error('No response from server');
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: language === 'ur'
                    ? 'معذرت، ابھی جواب نہیں ملا۔ دوبارہ کوشش کریں۔'
                    : 'Sorry, I\'m having trouble right now. Please try again in a moment.',
                timestamp: Date.now()
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleVoiceTranscript = (text: string) => {
        setInput(text);
        // Auto-send after a short delay to allow user to see it
        setTimeout(() => handleSend(text), 500);
    };

    const clearChat = async () => {
        const token = getAccessToken();
        if (token) {
            try {
                await fetch(`${API_BASE}/chat/history`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (err) {
                console.error('Failed to clear chat history:', err);
            }
        }

        const welcomeMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: language === 'ur'
                ? 'چیٹ صاف ہو گئی! نیا سوال پوچھیں۔'
                : 'Chat cleared! Ask me anything.',
            timestamp: Date.now()
        };
        setMessages([welcomeMsg]);
    };

    // Hide AI Assistant completely when not authenticated
    if (!isAuthenticated) {
        return null;
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50"
                title="Open AI Assistant"
            >
                <Sparkles className="h-6 w-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-card border rounded-2xl shadow-2xl flex flex-col z-50 animate-float-in overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-primary to-purple-500 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Bot className="h-6 w-6" />
                    <div>
                        <h3 className="font-semibold">AI Assistant</h3>
                        <p className="text-xs opacity-80">
                            {language === 'ur' ? 'ٹاسک مینجمنٹ' : 'Task Management'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={clearChat}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        title="Clear chat"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" ref={scrollRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex gap-2 max-w-[85%]",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white",
                            msg.role === 'user'
                                ? "bg-primary"
                                : "bg-emerald-500"
                        )}>
                            {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>

                        <div className={cn(
                            "rounded-2xl px-4 py-2 text-sm",
                            msg.role === 'user'
                                ? "bg-primary text-white rounded-tr-sm"
                                : "bg-muted rounded-tl-sm"
                        )}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div className="flex gap-2">
                        <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-card">
                <div className="flex items-center gap-2">
                    <VoiceInput onTranscript={handleVoiceTranscript} />

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={language === 'ur' ? 'پیغام لکھیں...' : 'Type a message...'}
                        className="flex-1 px-4 py-2 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary outline-none text-sm"
                        dir={language === 'ur' ? 'rtl' : 'ltr'}
                    />

                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isThinking}
                        className="p-2 rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
