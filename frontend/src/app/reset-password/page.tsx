"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const passwordRequirements = [
        { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
        { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
        { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
        { label: 'One number', test: (p: string) => /\d/.test(p) },
    ];

    const passwordValidation = passwordRequirements.map(req => ({
        ...req,
        passed: req.test(password)
    }));

    const isValid = passwordValidation.every(r => r.passed) && password === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid || !token) return;

        setIsSubmitting(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: password })
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => router.push('/'), 3000);
            } else {
                const data = await response.json();
                setStatus('error');
                setErrorMessage(data.detail || 'Failed to reset password');
            }
        } catch {
            setStatus('error');
            setErrorMessage('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Invalid Link</h2>
                <p className="text-muted-foreground">This password reset link is invalid or missing a token.</p>
                <Link href="/" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    Return Home
                </Link>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="text-center space-y-4 animate-in fade-in duration-500">
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Password Reset!</h2>
                <p className="text-muted-foreground">Your password has been successfully updated. Redirecting in 3 seconds...</p>
                <Link href="/" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
                <p className="text-muted-foreground text-sm">Create a new secure password for your account</p>
            </div>

            {status === 'error' && (
                <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm flex items-center gap-2">
                    <XCircle className="h-4 w-4 shrink-0" />
                    {errorMessage}
                </div>
            )}

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                            placeholder="Enter new password"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                            placeholder="Confirm new password"
                        />
                    </div>
                </div>

                {password && (
                    <div className="p-3 rounded-lg bg-muted/30 space-y-1.5">
                        {passwordValidation.map((req, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                                <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px]", req.passed ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground")}>
                                    {req.passed ? '✓' : '○'}
                                </span>
                                <span className={req.passed ? 'text-green-600' : 'text-muted-foreground'}>{req.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-medium hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset Password'}
            </button>

            <div className="text-center">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Back to Login
                </Link>
            </div>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card border border-border bg-card/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8">
                <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}
