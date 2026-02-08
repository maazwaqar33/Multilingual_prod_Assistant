"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

interface PasswordRequirement {
    label: string;
    labelUr: string;
    test: (p: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
    { label: 'At least 8 characters', labelUr: 'کم از کم 8 حروف', test: (p) => p.length >= 8 },
    { label: 'One uppercase letter', labelUr: 'ایک بڑا حرف', test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', labelUr: 'ایک چھوٹا حرف', test: (p) => /[a-z]/.test(p) },
    { label: 'One number', labelUr: 'ایک نمبر', test: (p) => /\d/.test(p) },
];

export default function RegisterPage() {
    const router = useRouter();
    const { register, isAuthenticated, isLoading: authLoading } = useAuth();
    const { language } = useApp();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            router.push('/');
        }
    }, [isAuthenticated, authLoading, router]);

    // Validation
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const passwordValidation = useMemo(() => {
        return passwordRequirements.map(req => ({
            ...req,
            passed: req.test(password)
        }));
    }, [password]);

    const isPasswordValid = passwordValidation.every(r => r.passed);
    const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;
    const canSubmit = isEmailValid && isPasswordValid && doPasswordsMatch && !isSubmitting;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setError('');
        setIsSubmitting(true);

        const result = await register(email, password);

        if (result.success) {
            setRegistrationSuccess(true);
            window.scrollTo(0, 0);
        } else {
            setError(result.error || 'Registration failed');
        }

        setIsSubmitting(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (registrationSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
                <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6 shadow-sm">
                        <CheckCircle className="h-10 w-10" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Check your inbox!</h1>
                    <p className="text-muted-foreground mb-6">
                        We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>.
                    </p>

                    <div className="p-4 bg-muted/50 rounded-xl mb-6 text-sm text-left space-y-3">
                        <p className="font-medium text-foreground">Next Steps:</p>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                            <li>Open your email inbox</li>
                            <li>Click the validation link</li>
                            <li>Log in to your account</li>
                        </ol>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 text-orange-700 text-sm text-left mb-6 border border-orange-500/20">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold mb-1">Don't see the email?</p>
                            <p>Please check your <strong>Spam</strong> or <strong>Junk</strong> folder. It can take a minute to arrive.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/login')}
                        className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                    >
                        Go to Login Page
                    </button>

                    <button
                        onClick={() => setRegistrationSuccess(false)}
                        className="mt-4 text-sm text-muted-foreground hover:text-foreground underline"
                    >
                        Back to Registration
                    </button>
                </div>
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
                        {language === 'ur' ? 'اکاؤنٹ بنائیں' : 'Create Account'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {language === 'ur' ? 'آج ہی اپنا TodoEvolve اکاؤنٹ بنائیں' : 'Start your productivity journey today'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-card rounded-2xl shadow-xl border p-6 space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Alert */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
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
                                    onFocus={() => setShowRequirements(true)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            {showRequirements && password && (
                                <div className="mt-2 p-3 rounded-lg bg-muted/50 space-y-1.5">
                                    {passwordValidation.map((req, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            {req.passed ? (
                                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <X className="h-3.5 w-3.5 text-muted-foreground" />
                                            )}
                                            <span className={req.passed ? 'text-green-600' : 'text-muted-foreground'}>
                                                {language === 'ur' ? req.labelUr : req.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">
                                {language === 'ur' ? 'پاس ورڈ کی تصدیق' : 'Confirm Password'}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                                    autoComplete="new-password"
                                />
                                {confirmPassword && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {doPasswordsMatch ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                            {confirmPassword && !doPasswordsMatch && (
                                <p className="text-xs text-red-500 mt-1">
                                    {language === 'ur' ? 'پاس ورڈ مماثل نہیں ہے' : 'Passwords do not match'}
                                </p>
                            )}
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
                                    {language === 'ur' ? 'اکاؤنٹ بن رہا ہے...' : 'Creating account...'}
                                </>
                            ) : (
                                language === 'ur' ? 'اکاؤنٹ بنائیں' : 'Create Account'
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

                    {/* Login Link */}
                    <p className="text-center text-sm text-muted-foreground">
                        {language === 'ur' ? 'پہلے سے اکاؤنٹ ہے؟' : 'Already have an account?'}{' '}
                        <a
                            href="/login"
                            className="text-primary hover:underline font-medium"
                        >
                            {language === 'ur' ? 'لاگ ان کریں' : 'Sign in'}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
