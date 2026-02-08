"use client";

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface SearchFilterProps {
    onSearch: (query: string, filters: { status: string; priority: string }) => void;
}

export function SearchFilter({ onSearch }: SearchFilterProps) {
    const { language } = useApp();
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [priority, setPriority] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    const handleChange = (newQuery?: string, newStatus?: string, newPriority?: string) => {
        const q = newQuery ?? query;
        const s = newStatus ?? status;
        const p = newPriority ?? priority;

        if (newQuery !== undefined) setQuery(q);
        if (newStatus !== undefined) setStatus(s);
        if (newPriority !== undefined) setPriority(p);

        onSearch(q, { status: s, priority: p });
    };

    const clearFilters = () => {
        setQuery('');
        setStatus('all');
        setPriority('all');
        onSearch('', { status: 'all', priority: 'all' });
    };

    const hasActiveFilters = query || status !== 'all' || priority !== 'all';

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={language === 'ur' ? 'ٹاسک تلاش کریں...' : 'Search tasks...'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none text-sm"
                    />
                </div>

                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "p-2.5 rounded-xl transition-colors",
                        showFilters || hasActiveFilters
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted-foreground/10"
                    )}
                >
                    <Filter className="h-4 w-4" />
                </button>

                {/* Clear */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Filter Options */}
            {showFilters && (
                <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-xl animate-float-in">
                    {/* Status Filter */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            {language === 'ur' ? 'حیثیت' : 'Status'}
                        </label>
                        <select
                            value={status}
                            onChange={(e) => handleChange(undefined, e.target.value)}
                            className="px-3 py-2 rounded-lg bg-card border text-sm outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">{language === 'ur' ? 'سب' : 'All'}</option>
                            <option value="pending">{language === 'ur' ? 'باقی' : 'Pending'}</option>
                            <option value="completed">{language === 'ur' ? 'مکمل' : 'Completed'}</option>
                        </select>
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            {language === 'ur' ? 'ترجیح' : 'Priority'}
                        </label>
                        <select
                            value={priority}
                            onChange={(e) => handleChange(undefined, undefined, e.target.value)}
                            className="px-3 py-2 rounded-lg bg-card border text-sm outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">{language === 'ur' ? 'سب' : 'All'}</option>
                            <option value="high">{language === 'ur' ? 'اعلی' : 'High'}</option>
                            <option value="medium">{language === 'ur' ? 'درمیانی' : 'Medium'}</option>
                            <option value="low">{language === 'ur' ? 'کم' : 'Low'}</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
