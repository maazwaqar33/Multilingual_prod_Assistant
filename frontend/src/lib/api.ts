import { Task, TaskPriority } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Token storage keys (must match AuthContext)
const ACCESS_TOKEN_KEY = 'todoevolve_access_token';

// Get access token from localStorage
function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// Get user ID from token or default
function getUserId(): string {
    const token = getAccessToken();
    if (token) {
        try {
            // Decode JWT payload (base64url)
            const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            return payload.sub || 'user_123';
        } catch (e) {
            console.error('Token decode error:', e);
            return 'user_123';
        }
    }
    return 'user_123'; // Fallback for dev mode
}

class ApiClient {
    private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const userId = getUserId();
        const url = `${API_URL}/api/${userId}${endpoint}`;
        const token = getAccessToken();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        // Attach JWT token if available
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            // Handle 401 Unauthorized - clear tokens
            if (response.status === 401) {
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem('todoevolve_refresh_token');
                // Could trigger redirect to login here
            }
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `API Error: ${response.statusText}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    async getTasks(status?: string): Promise<{ tasks: Task[]; total: number }> {
        const params = new URLSearchParams();
        if (status) params.append('status', status);

        return this.fetch(`/tasks?${params.toString()}`);
    }

    async createTask(data: { title: string; description?: string; priority: TaskPriority; tags: string[] }): Promise<Task> {
        return this.fetch('/tasks', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateTask(id: number, data: Partial<Task>): Promise<Task> {
        return this.fetch(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTask(id: number): Promise<void> {
        return this.fetch(`/tasks/${id}`, {
            method: 'DELETE',
        });
    }

    async toggleComplete(id: number): Promise<{ id: number; completed: boolean; message: string }> {
        return this.fetch(`/tasks/${id}/complete`, {
            method: 'PATCH',
        });
    }

    // Chat API
    async sendChatMessage(message: string, language: string = 'en'): Promise<{
        response: string;
        action_performed: boolean;
        tool?: string;
        model?: string;
    }> {
        const token = getAccessToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/chat/`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ message, language }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || 'Chat failed');
        }

        return response.json();
    }
}

export const api = new ApiClient();
