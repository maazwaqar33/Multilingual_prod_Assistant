// [Spec]: specs/ui/components.md
"use client";

import React, { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskPriority } from '@/types';
import { VoiceInput } from './VoiceInput';
import { useApp } from '@/context/AppContext';

interface TaskFormProps {
    onSubmit: (data: { title: string; description?: string; priority: TaskPriority; tags: string[]; due_date?: string }) => void;
    className?: string;
}

export function TaskForm({ onSubmit, className }: TaskFormProps) {
    const { t, language } = useApp();
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [tagsInput, setTagsInput] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
            due_date: dueDate || undefined
        });

        // Reset form
        setTitle('');
        setDescription('');
        setPriority('medium');
        setTagsInput('');
        setDueDate('');
        setIsExpanded(false);
    };

    const handleVoiceTranscript = (text: string) => {
        setTitle(prev => prev ? `${prev} ${text}` : text);
        if (!isExpanded) setIsExpanded(true);
    };

    const priorityConfig = {
        high: { label: language === 'ur' ? 'اعلی' : 'High', color: 'bg-red-500 text-white' },
        medium: { label: language === 'ur' ? 'درمیانی' : 'Medium', color: 'bg-amber-500 text-white' },
        low: { label: language === 'ur' ? 'کم' : 'Low', color: 'bg-emerald-500 text-white' }
    };

    if (!isExpanded) {
        return (
            <div className={cn("group", className)}>
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full p-5 rounded-2xl border-2 border-dashed border-muted hover:border-primary/50 bg-card hover:bg-muted/30 transition-all duration-300 flex items-center gap-4 text-left"
                >
                    <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Plus className="h-5 w-5 text-primary group-hover:text-white" />
                    </div>
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                        {t('tasks.add')}
                    </span>
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={cn("p-6 rounded-2xl border bg-card shadow-lg animate-float-in", className)}>
            <div className="space-y-4">
                {/* Title with Voice */}
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t('tasks.title')}
                        autoFocus
                        className="w-full pl-4 pr-12 py-3 text-lg font-medium rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <VoiceInput onTranscript={handleVoiceTranscript} className="hover:bg-background/80" />
                    </div>
                </div>

                {/* Description */}
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('tasks.description')}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none resize-none text-sm"
                />

                {/* Priority Dropdown & Tags */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Priority Dropdown */}
                    <div className="relative z-20">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            {t('tasks.priority')}
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                            className={cn(
                                "w-full px-4 py-2.5 rounded-xl flex items-center justify-between transition-all border-2 border-transparent",
                                priorityConfig[priority].color,
                                "hover:brightness-110 active:scale-[0.98]"
                            )}
                        >
                            <span className="font-medium flex items-center gap-2">
                                <span className="bg-white/20 p-1 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                </span>
                                {priorityConfig[priority].label}
                            </span>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", showPriorityDropdown && "rotate-180")} />
                        </button>

                        {showPriorityDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowPriorityDropdown(false)}
                                />
                                <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                    {(['high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => { setPriority(p); setShowPriorityDropdown(false); }}
                                            className={cn(
                                                "w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-l-4",
                                                priority === p
                                                    ? "bg-muted border-primary"
                                                    : "hover:bg-muted/50 border-transparent"
                                            )}
                                        >
                                            <span className={cn("w-3 h-3 rounded-full shadow-sm",
                                                p === 'high' ? 'bg-red-500' : p === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                            )} />
                                            <span className="font-medium capitalize text-sm">{priorityConfig[p].label}</span>
                                            {priority === p && (
                                                <div className="ml-auto text-primary text-xs font-bold px-2 py-0.5 rounded bg-primary/10">Selected</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            {t('tasks.tags')}
                        </label>
                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="work, personal"
                            className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                        />
                    </div>
                </div>

                {/* Due Date */}
                <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        {language === 'ur' ? 'آخری تاریخ' : 'Due Date'}
                    </label>
                    <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(false)}
                        className="px-5 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
                    >
                        {t('tasks.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium shadow-md hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        {t('tasks.submit')}
                    </button>
                </div>
            </div>
        </form>
    );
}
