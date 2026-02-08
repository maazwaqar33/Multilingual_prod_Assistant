"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const { t, language, isDark } = useApp();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            router.push('/');
        }
    }, [isAuthenticated, authLoading, router]);

    // Validation
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 8;
    const canSubmit = isEmailValid && isPasswordValid && !isSubmitting;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setError('');
        setResendSuccess(false);
        setIsSubmitting(true);

        const result = await login(email, password);

        if (result.success) {
            router.push('/');
        } else {
            setError(result.error || 'Login failed');
        }

        setIsSubmitting(false);
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_BASE}/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                setResendSuccess(true);
                setError('');
            } else {
                setError(data.detail || 'Failed to resend');
            }
        } catch (err) {
            setError('Network error');
        }
        setIsResending(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white text-2xl font-bold mb-4 shadow-lg shadow-primary/25">
                        T
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {language === 'ur' ? 'لاگ ان کریں' : 'Welcome Back'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {language === 'ur' ? 'اپنے اکاؤنٹ میں سائن ان کریں' : 'Sign in to your TodoEvolve account'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-card rounded-2xl shadow-xl border p-6 space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Resend Success Message */}
                        {resendSuccess && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 text-sm">
                                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                <span>Verification email sent! Check your inbox.</span>
                            </div>
                        )}

                        {/* Error Alert */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                                {error.toLowerCase().includes('verified') && (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={isResending}
                                        className="text-xs font-semibold underline hover:text-red-600 flex items-center gap-1"
                                    >
                                        {isResending ? (
                                            <>
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Resend Verification Email"
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">
                                {language === 'ur' ? 'ای میل' : 'Email'}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                                    autoComplete="email"
                                />
                                {email && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {isEmailValid ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">
                                {language === 'ur' ? 'پاس ورڈ' : 'Password'}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-medium transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {language === 'ur' ? 'لاگ ان ہو رہا ہے...' : 'Signing in...'}
                                </>
                            ) : (
                                language === 'ur' ? 'لاگ ان' : 'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-card px-2 text-muted-foreground">
                                {language === 'ur' ? 'یا' : 'or'}
                            </span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <p className="text-center text-sm text-muted-foreground">
                        {language === 'ur' ? 'اکاؤنٹ نہیں ہے؟' : "Don't have an account?"}{' '}
                        <a
                            href="/register"
                            className="text-primary hover:underline font-medium"
                        >
                            {language === 'ur' ? 'رجسٹر کریں' : 'Sign up'}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
