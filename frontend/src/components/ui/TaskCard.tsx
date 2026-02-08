// [Spec]: specs/ui/components.md
import React from 'react';
import { Check, Trash2, Clock, AlertTriangle, Tag, MoreVertical } from 'lucide-react';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TaskCardProps {
    task: Task;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
    const priorityStyles = {
        high: {
            badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
            dot: 'bg-red-500'
        },
        medium: {
            badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            dot: 'bg-amber-500'
        },
        low: {
            badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            dot: 'bg-emerald-500'
        }
    };

    const styles = priorityStyles[task.priority] || priorityStyles.medium;

    return (
        <div
            className={cn(
                "group p-5 rounded-2xl border bg-card transition-all duration-300",
                "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
                "hover:border-primary/30",
                task.completed && "opacity-60"
            )}
        >
            <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                    onClick={() => onToggle(task.id)}
                    className={cn(
                        "mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                        task.completed
                            ? "bg-gradient-to-br from-emerald-500 to-green-500 border-transparent text-white"
                            : "border-muted-foreground/30 hover:border-primary hover:bg-primary/5"
                    )}
                >
                    {task.completed && <Check className="h-3.5 w-3.5" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h4 className={cn(
                                "font-medium text-base leading-snug",
                                task.completed && "line-through text-muted-foreground"
                            )}>
                                {task.title}
                            </h4>

                            {task.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {task.description}
                                </p>
                            )}
                        </div>

                        {/* Priority Badge */}
                        <span className={cn(
                            "px-2.5 py-1 text-xs font-medium rounded-full border shrink-0",
                            styles.badge
                        )}>
                            {task.priority}
                        </span>
                    </div>

                    {/* Tags & Meta */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <Tag className="h-3 w-3 text-muted-foreground" />
                                {task.tags.slice(0, 3).map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {task.tags.length > 3 && (
                                    <span className="text-xs text-muted-foreground">
                                        +{task.tags.length - 3}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(task.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Delete Button */}
                <button
                    onClick={() => onDelete(task.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete task"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
