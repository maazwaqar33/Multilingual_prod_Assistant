"use client";

import React from 'react';
import { Sparkles, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Task } from '@/types';

interface AIInsightsProps {
    tasks: Task[];
    className?: string;
}

export function AIInsights({ tasks, className }: AIInsightsProps) {
    const { t, language } = useApp();

    // Calculate insights
    const pendingTasks = tasks.filter(t => !t.completed);
    const highPriorityCount = pendingTasks.filter(t => t.priority === 'high').length;
    const completedToday = tasks.filter(t => {
        if (!t.completed) return false;
        const today = new Date().toDateString();
        return new Date(t.updated_at).toDateString() === today;
    }).length;

    const insights = [
        {
            icon: AlertTriangle,
            color: 'text-warning',
            bgColor: 'bg-warning/10',
            title: language === 'ur' ? 'اعلی ترجیح' : 'High Priority',
            value: highPriorityCount,
            description: language === 'ur'
                ? `${highPriorityCount} ٹاسک فوری توجہ چاہتے ہیں`
                : `${highPriorityCount} tasks need immediate attention`,
            show: highPriorityCount > 0,
        },
        {
            icon: TrendingUp,
            color: 'text-success',
            bgColor: 'bg-success/10',
            title: language === 'ur' ? 'آج کی پیشرفت' : 'Today\'s Progress',
            value: completedToday,
            description: language === 'ur'
                ? `آج ${completedToday} ٹاسک مکمل کیے`
                : `Completed ${completedToday} tasks today`,
            show: true,
        },
        {
            icon: Clock,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            title: language === 'ur' ? 'باقی ٹاسک' : 'Pending Tasks',
            value: pendingTasks.length,
            description: language === 'ur'
                ? `${pendingTasks.length} ٹاسک مکمل کرنے باقی ہیں`
                : `${pendingTasks.length} tasks remaining`,
            show: true,
        },
    ];

    const visibleInsights = insights.filter(i => i.show);

    if (visibleInsights.length === 0) {
        return null;
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-purple-500">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-lg">{t('ai.insights')}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {visibleInsights.map((insight, i) => (
                    <div
                        key={i}
                        className={cn(
                            "p-4 rounded-xl border bg-card card-hover",
                            "animate-float-in"
                        )}
                        style={{ animationDelay: `${i * 0.1}s` }}
                    >
                        <div className="flex items-start gap-3">
                            <div className={cn("p-2 rounded-lg", insight.bgColor)}>
                                <insight.icon className={cn("h-5 w-5", insight.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-muted-foreground">{insight.title}</p>
                                <p className="text-2xl font-bold mt-1">{insight.value}</p>
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                    {insight.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Suggestion */}
            {highPriorityCount > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-primary">{t('ai.suggestion')}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {language === 'ur'
                                    ? 'پہلے اعلی ترجیحی ٹاسک مکمل کرنے پر غور کریں۔ چھوٹے کاموں سے شروع کریں!'
                                    : 'Consider completing high-priority tasks first. Start with the smallest one to build momentum!'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
