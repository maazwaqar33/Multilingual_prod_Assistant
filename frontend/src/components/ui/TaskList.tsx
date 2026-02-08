// [Spec]: specs/ui/components.md
import React from 'react';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { FolderOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
    tasks: Task[];
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
    loading?: boolean;
}

export function TaskList({ tasks, onToggle, onDelete, loading }: TaskListProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="p-5 rounded-2xl border bg-card animate-pulse"
                    >
                        <div className="flex items-start gap-4">
                            <div className="h-6 w-6 rounded-full bg-muted" />
                            <div className="flex-1 space-y-3">
                                <div className="h-5 w-3/4 bg-muted rounded-lg" />
                                <div className="h-4 w-1/2 bg-muted rounded-lg" />
                                <div className="flex gap-2">
                                    <div className="h-6 w-16 bg-muted rounded-full" />
                                    <div className="h-6 w-20 bg-muted rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-2xl bg-muted/50 mb-4">
                    <FolderOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium">No tasks yet</h4>
                <p className="text-muted-foreground mt-1">
                    Create your first task to get started!
                </p>
            </div>
        );
    }

    // Sort tasks: incomplete first, then by priority, then by date
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (a.priority !== b.priority) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return (
        <div className="space-y-3">
            {sortedTasks.map((task, i) => (
                <div
                    key={task.id}
                    className="animate-float-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                >
                    <TaskCard
                        task={task}
                        onToggle={onToggle}
                        onDelete={onDelete}
                    />
                </div>
            ))}
        </div>
    );
}
