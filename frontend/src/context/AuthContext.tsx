"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

// Types
interface User {
    id: number;
    email: string;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
    last_login: string | null;
    profile_picture?: string | null;
}

interface AuthTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    getAccessToken: () => string | null;
    uploadAvatar: (file: File) => Promise<{ success: boolean; error?: string }>;
    changePassword: (current: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Token storage keys
const ACCESS_TOKEN_KEY = 'todoevolve_access_token';
const REFRESH_TOKEN_KEY = 'todoevolve_refresh_token';
const TOKEN_EXPIRY_KEY = 'todoevolve_token_expiry';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Get tokens from localStorage
    const getStoredTokens = useCallback(() => {
        if (typeof window === 'undefined') return null;
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
        if (!accessToken || !refreshToken) return null;
        return { accessToken, refreshToken, expiry: expiry ? parseInt(expiry) : 0 };
    }, []);

    // Store tokens
    const storeTokens = useCallback((tokens: AuthTokens) => {
        const expiryTime = Date.now() + (tokens.expires_in * 1000) - 60000; // Subtract 1 min buffer
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    }, []);

    // Clear tokens
    const clearTokens = useCallback(() => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
    }, []);

    // Fetch user profile
    const fetchUser = useCallback(async (accessToken: string): Promise<User | null> => {
        try {
            const response = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch {
            return null;
        }
    }, []);

    // Refresh tokens
    const refreshTokens = useCallback(async (refreshToken: string): Promise<AuthTokens | null> => {
        try {
            const response = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch {
            return null;
        }
    }, []);

    // Initialize auth state on mount
    useEffect(() => {
        const initAuth = async () => {
            const stored = getStoredTokens();
            if (!stored) {
                setIsLoading(false);
                return;
            }

            // Check if token is expired
            const now = Date.now();
            if (stored.expiry && now >= stored.expiry) {
                // Try to refresh
                const newTokens = await refreshTokens(stored.refreshToken);
                if (newTokens) {
                    storeTokens(newTokens);
                    const userData = await fetchUser(newTokens.access_token);
                    setUser(userData);
                } else {
                    clearTokens();
                }
            } else {
                // Token still valid, fetch user
                const userData = await fetchUser(stored.accessToken);
                if (userData) {
                    setUser(userData);
                } else {
                    // Token invalid, try refresh
                    const newTokens = await refreshTokens(stored.refreshToken);
                    if (newTokens) {
                        storeTokens(newTokens);
                        const refreshedUser = await fetchUser(newTokens.access_token);
                        setUser(refreshedUser);
                    } else {
                        clearTokens();
                    }
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, [getStoredTokens, fetchUser, refreshTokens, storeTokens, clearTokens]);

    // Auto-refresh token before expiry
    useEffect(() => {
        if (!user) return;

        const stored = getStoredTokens();
        if (!stored?.expiry) return;

        const timeUntilExpiry = stored.expiry - Date.now();
        if (timeUntilExpiry <= 0) return;

        // Refresh 2 minutes before expiry
        const refreshTime = Math.max(timeUntilExpiry - 120000, 1000);

        const timer = setTimeout(async () => {
            const currentTokens = getStoredTokens();
            if (currentTokens) {
                const newTokens = await refreshTokens(currentTokens.refreshToken);
                if (newTokens) {
                    storeTokens(newTokens);
                }
            }
        }, refreshTime);

        return () => clearTimeout(timer);
    }, [user, getStoredTokens, refreshTokens, storeTokens]);

    // Login
    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const tokens: AuthTokens = await response.json();
                storeTokens(tokens);
                const userData = await fetchUser(tokens.access_token);
                setUser(userData);
                return { success: true };
            } else {
                const error = await response.json();
                return { success: false, error: error.detail || 'Login failed' };
            }
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    // Register
    const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok || response.status === 201) {
                // Registration successful, do not auto-login (require verification)
                return { success: true };
            } else {
                const error = await response.json();
                return { success: false, error: error.detail || 'Registration failed' };
            }
        } catch (err) {
            console.error('Registration error:', err);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    // Logout
    const logout = async () => {
        const stored = getStoredTokens();
        if (stored?.refreshToken) {
            try {
                await fetch(`${API_BASE}/auth/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: stored.refreshToken })
                });
            } catch {
                // Ignore logout errors
            }
        }
        clearTokens();
        setUser(null);
        // Clear all user data to prevent stale data from previous user
        localStorage.removeItem('todoevolve_chat_history');
        localStorage.removeItem('todoevolve_tasks');
        localStorage.removeItem('todoevolve_local_tasks');
        // Force page reload to clear any cached UI state
        window.location.href = '/';
    };

    // Get current access token
    const getAccessToken = useCallback((): string | null => {
        const stored = getStoredTokens();
        return stored?.accessToken || null;
    }, [getStoredTokens]);

    // Upload Avatar
    const uploadAvatar = async (file: File): Promise<{ success: boolean; error?: string }> => {
        const token = getAccessToken();
        if (!token) return { success: false, error: 'Not authenticated' };

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE}/auth/upload-avatar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                return { success: true };
            } else {
                return { success: false, error: 'Failed to upload image' };
            }
        } catch {
            return { success: false, error: 'Network error' };
        }
    };

    // Change Password
    const changePassword = async (current: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
        const token = getAccessToken();
        if (!token) return { success: false, error: 'Not authenticated' };

        try {
            const response = await fetch(`${API_BASE}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ current_password: current, new_password: newPass })
            });

            if (response.ok) {
                return { success: true };
            } else {
                const data = await response.json();
                return { success: false, error: data.detail || 'Failed to change password' };
            }
        } catch {
            return { success: false, error: 'Network error' };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            register,
            logout,
            getAccessToken,
            uploadAvatar,
            changePassword
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
