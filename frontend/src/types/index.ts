export interface Task {
    id: number;
    user_id: string;
    title: string;
    description: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
    tags: string[];
    due_date?: string;
    created_at: string;
    updated_at: string;
}

export type TaskStatus = 'all' | 'pending' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';
