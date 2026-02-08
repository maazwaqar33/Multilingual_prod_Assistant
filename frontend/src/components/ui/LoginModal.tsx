"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import {
    Eye, EyeOff, Mail, Lock, Loader2, X, User,
    Camera, LogOut, Settings, ArrowLeft, Upload, CheckCircle, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type LoginMode = 'login' | 'register' | 'forgot' | 'change-password' | 'register-success';

interface LoginDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: LoginMode;
}

// Password requirements properties (reused)
const passwordRequirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number', test: (p: string) => /\d/.test(p) },
];

export function LoginModal({ isOpen, onClose, initialMode = 'login' }: LoginDrawerProps) {
    const { login, register, changePassword } = useAuth();
    const { language } = useApp();
    const drawerRef = useRef<HTMLDivElement>(null);

    const [mode, setMode] = useState<LoginMode>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // For change password
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Sync initial mode
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            // Reset forms
            setError('');
            setSuccess('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setCurrentPassword('');
            setNewPassword('');
        }
    }, [isOpen, initialMode]);

    // Handle open/close animation
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Validation
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValidation = passwordRequirements.map(req => ({
        ...req,
        passed: req.test(mode === 'change-password' ? newPassword : password)
    }));

    // Check validation based on mode
    let canSubmit = false;
    if (mode === 'login') canSubmit = isEmailValid && password.length >= 1;
    else if (mode === 'register') canSubmit = isEmailValid && passwordValidation.every(r => r.passed) && password === confirmPassword;
    else if (mode === 'forgot') canSubmit = isEmailValid;
    else if (mode === 'change-password') canSubmit = currentPassword.length >= 1 && passwordValidation.every(r => r.passed);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            if (mode === 'login') {
                const result = await login(email, password);
                if (result.success) {
                    onClose();
                } else {
                    setError(result.error || 'Login failed');
                }
            } else if (mode === 'register') {
                const result = await register(email, password);
                if (result.success) {
                    setMode('register-success');
                } else {
                    setError(result.error || 'Registration failed');
                }
            } else if (mode === 'forgot') {
                // Call backend SMTP forgot password
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/forgot-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });
                    if (response.ok) {
                        setSuccess(language === 'ur' ? 'پاس ورڈ ری سیٹ لنک بھیج دیا گیا!' : 'Password reset link sent to your email!');
                    } else {
                        const data = await response.json();
                        setError(data.detail || 'Failed to send reset email');
                    }
                } catch {
                    setError('Network error. Please try again.');
                }
            } else if (mode === 'change-password') {
                const result = await changePassword(currentPassword, newPassword);
                if (result.success) {
                    setSuccess('Password changed successfully');
                    setCurrentPassword('');
                    setNewPassword('');
                } else {
                    setError(result.error || 'Failed to change password');
                }
            }
        } catch {
            setError('An unexpected error occurred');
        }

        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
                    isVisible ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Right Side Drawer */}
            <div
                ref={drawerRef}
                className={cn(
                    "fixed top-0 right-0 h-full w-full max-w-sm bg-card border-l border-border shadow-2xl",
                    "transform transition-transform duration-300 ease-out",
                    isVisible ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="h-full overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b p-4 flex items-center gap-3 z-10">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                {mode === 'login' && (language === 'ur' ? 'لاگ ان' : 'Sign In')}
                                {mode === 'register' && (language === 'ur' ? 'اکاؤنٹ بنائیں' : 'Create Account')}
                                {mode === 'forgot' && (language === 'ur' ? 'پاس ورڈ ری سیٹ' : 'Reset Password')}
                                {mode === 'change-password' && (language === 'ur' ? 'پاس ورڈ تبدیل کریں' : 'Change Password')}
                                {mode === 'register-success' && 'Account Created'}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {mode === 'login' && 'Welcome back to TodoEvolve'}
                                {mode === 'register' && 'Join us today'}
                                {mode === 'forgot' && 'Enter your email to reset'}
                                {mode === 'change-password' && 'Update your security settings'}
                                {mode === 'register-success' && 'Please verify your email'}
                            </p>
                        </div>
                    </div>

                    <div className="p-6">
                        {mode === 'register-success' ? (
                            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 shadow-sm">
                                    <Mail className="h-10 w-10" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">Check your inbox!</h3>
                                    <p className="text-muted-foreground text-sm">
                                        We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>.
                                    </p>
                                </div>

                                <div className="p-4 bg-muted/50 rounded-xl text-sm text-left space-y-3">
                                    <p className="font-medium text-foreground">Next Steps:</p>
                                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                        <li>Open your email inbox</li>
                                        <li>Click the validation link</li>
                                        <li>Return here to sign in</li>
                                    </ol>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 text-orange-700 text-xs text-left border border-orange-500/20">
                                    <div className="mt-0.5">⚠️</div>
                                    <div>
                                        <p className="font-semibold mb-1">Don't see it?</p>
                                        <p>Check your <strong>Spam</strong> or Junk folder.</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setMode('login')}
                                    className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                                >
                                    Proceed to Sign In
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Messages */}
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm flex items-center gap-2">
                                        <X className="h-4 w-4 shrink-0" /> {error}
                                    </div>
                                )}
                                {success && mode !== 'register-success' && (
                                    <div className="p-3 rounded-lg bg-green-500/10 text-green-500 text-sm">
                                        ✓ {success}
                                    </div>
                                )}

                                {/* Standard Email/Pass Fields */}
                                {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="you@example.com"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>

                                        {mode !== 'forgot' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                                                        disabled={isSubmitting}
                                                    />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {mode === 'register' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Confirm Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                                {/* Requirements List */}
                                                {password && (
                                                    <div className="mt-2 p-3 rounded-lg bg-muted/30 space-y-1.5">
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
                                        )}
                                    </div>
                                )}

                                {/* Change Password Form */}
                                {mode === 'change-password' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Current Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                                                    disabled={isSubmitting}
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {/* Requirements List */}
                                            {newPassword && (
                                                <div className="mt-2 p-3 rounded-lg bg-muted/30 space-y-1.5">
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
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!canSubmit || isSubmitting}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-medium hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Update Password'}
                                </button>

                                {/* Mode Switching Links */}
                                {mode !== 'change-password' && (
                                    <div className="space-y-3 pt-2">
                                        <div className="relative flex justify-center text-xs pb-2">
                                            <span className="bg-card px-2 text-muted-foreground">or</span>
                                            <div className="absolute inset-0 flex items-center -z-10"><div className="w-full border-t border-border"></div></div>
                                        </div>

                                        {mode === 'login' && (
                                            <>
                                                <button type="button" onClick={() => setMode('register')} className="w-full py-3 rounded-xl border-2 border-primary/30 text-primary font-medium hover:bg-primary/10 transition-all">Create New Account</button>
                                                <button type="button" onClick={() => setMode('forgot')} className="w-full text-sm text-muted-foreground hover:text-primary">Forgot password?</button>
                                            </>
                                        )}
                                        {mode !== 'login' && (
                                            <button type="button" onClick={() => setMode('login')} className="w-full py-3 rounded-xl border-2 border-border text-foreground font-medium hover:bg-muted transition-all">Back to Sign In</button>
                                        )}
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// User Avatar Component
interface UserAvatarProps {
    onClick?: () => void;
    onOpenSettings?: () => void;
    size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ onClick, onOpenSettings, size = 'md' }: UserAvatarProps) {
    const { user, isAuthenticated, logout, uploadAvatar } = useAuth();
    const { language } = useApp();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const sizeClasses = {
        sm: 'h-8 w-8 text-xs',
        md: 'h-9 w-9 text-sm',
        lg: 'h-12 w-12 text-lg',
    };

    const getInitials = () => {
        if (!user?.email) return 'U';
        const parts = user.email.split('@')[0].split(/[._-]/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return user.email.substring(0, 2).toUpperCase();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const result = await uploadAvatar(file);
        setIsUploading(false);

        if (result.success) {
            setShowMenu(false);
        } else {
            alert('Failed to upload image');
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isAuthenticated) {
        return (
            <button
                onClick={onClick}
                className={cn(
                    "rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border-2 border-dashed border-primary/50 flex items-center justify-center text-primary hover:border-primary hover:scale-105 transition-all",
                    sizeClasses[size]
                )}
            >
                <User className="h-4 w-4" />
            </button>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className={cn(
                    "rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all",
                    sizeClasses[size]
                )}
            >
                {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : user?.profile_picture ? (
                    <img src={user.profile_picture} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                    getInitials()
                )}
            </button>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-2xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b bg-muted/30 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                            {user?.profile_picture ? <img src={user.profile_picture} className="h-full w-full object-cover" /> : getInitials()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.email?.split('@')[0]}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    </div>

                    <div className="p-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm text-left"
                            disabled={isUploading}
                        >
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            {isUploading ? 'Uploading...' : (language === 'ur' ? 'پروفائل تصویر' : 'Change Picture')}
                        </button>
                        <button
                            onClick={() => {
                                setShowMenu(false);
                                onOpenSettings?.();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm text-left"
                        >
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            {language === 'ur' ? 'ترتیبات' : 'Settings'}
                        </button>
                        <hr className="my-2 border-border" />
                        <button
                            onClick={() => { logout(); setShowMenu(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors text-sm text-left"
                        >
                            <LogOut className="h-4 w-4" />
                            {language === 'ur' ? 'لاگ آؤٹ' : 'Sign Out'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
