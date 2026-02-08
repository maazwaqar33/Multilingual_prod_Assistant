"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    className?: string;
}

export function VoiceInput({ onTranscript, className }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [displayText, setDisplayText] = useState('');
    const recognitionRef = useRef<any>(null);
    const transcriptRef = useRef<string>('');

    const startListening = useCallback(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognitionRef.current = recognition;
        transcriptRef.current = '';

        recognition.onstart = () => {
            setIsListening(true);
            setDisplayText('');
        };

        recognition.onresult = (event: any) => {
            // Build the full transcript from all results
            let fullTranscript = '';

            for (let i = 0; i < event.results.length; i++) {
                fullTranscript += event.results[i][0].transcript;
            }

            // Store in ref for immediate access
            transcriptRef.current = fullTranscript;
            setDisplayText(fullTranscript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            setDisplayText('');
        };

        recognition.onend = () => {
            setIsListening(false);
            // Send the accumulated transcript when recognition ends
            const finalText = transcriptRef.current.trim();
            if (finalText) {
                onTranscript(finalText);
            }
            transcriptRef.current = '';
            setDisplayText('');
        };

        recognition.start();
    }, [onTranscript]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            // onend handler will send the transcript
        }
    }, []);

    if (!isSupported) return null;

    return (
        <div className="flex items-center gap-2">
            {isListening && displayText && (
                <span className="text-xs text-muted-foreground max-w-[150px] truncate italic">
                    "{displayText}"
                </span>
            )}
            <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={cn(
                    "p-2 rounded-full transition-all duration-200",
                    isListening
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-muted text-muted-foreground hover:bg-primary hover:text-white",
                    className
                )}
                title={isListening ? 'Click to stop and send' : 'Click to start voice input'}
            >
                {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
        </div>
    );
}
