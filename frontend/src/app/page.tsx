"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Task } from '@/types';
import { api } from '@/lib/api';
import { TaskList } from '@/components/ui/TaskList';
import { TaskForm } from '@/components/ui/TaskForm';
import { LangToggle } from '@/components/ui/LangToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AIInsights } from '@/components/ui/AIInsights';
import { AIChatWidget } from '@/components/ui/AIChatWidget';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { LoginModal, UserAvatar } from '@/components/ui/LoginModal';
import { LayoutDashboard } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useTaskNotifications } from '@/hooks/useTaskNotifications';

export default function Dashboard() {
  const { t, language } = useApp();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  // Enable browser notifications for due tasks
  useTaskNotifications(tasks);

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'login' | 'register' | 'forgot' | 'change-password' | null>(null);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'ur' ? 'صبح بخیر' : 'Good Morning';
    if (hour < 17) return language === 'ur' ? 'سہ پہر بخیر' : 'Good Afternoon';
    return language === 'ur' ? 'شام بخیر' : 'Good Evening';
  };

  // Get display name from user email
  const getDisplayName = () => {
    if (!user?.email) return 'User';
    const name = user.email.split('@')[0];
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data.tasks);
      setFilteredTasks(data.tasks);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      setError(t('error.backend'));
    } finally {
      setLoading(false);
    }
  }, [t, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [fetchTasks, isAuthenticated]);

  const handleCreate = async (data: { title: string; description?: string; priority: 'high' | 'medium' | 'low'; tags: string[]; due_date?: string }) => {
    try {
      const tempTask: Task = {
        id: Date.now(),
        user_id: user?.id?.toString() || 'user_123',
        ...data,
        description: data.description || "",
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setTasks(prev => [tempTask, ...prev]);
      setFilteredTasks(prev => [tempTask, ...prev]);

      const newTask = await api.createTask(data);
      setTasks(prev => prev.map(t => t.id === tempTask.id ? newTask : t));
      setFilteredTasks(prev => prev.map(t => t.id === tempTask.id ? newTask : t));
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      setFilteredTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      await api.toggleComplete(id);
    } catch (err) {
      console.error("Failed to toggle task", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setTasks(prev => prev.filter(t => t.id !== id));
      setFilteredTasks(prev => prev.filter(t => t.id !== id));
      await api.deleteTask(id);
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleSearch = (query: string, filters: { status: string; priority: string }) => {
    let result = [...tasks];

    // Search by title/description
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Filter by status
    if (filters.status === 'completed') {
      result = result.filter(t => t.completed);
    } else if (filters.status === 'pending') {
      result = result.filter(t => !t.completed);
    }

    // Filter by priority
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter(t => t.priority === filters.priority);
    }

    setFilteredTasks(result);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">TodoEvolve</h1>
          </div>

          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
            <UserAvatar
              onClick={() => setLoginMode('login')}
              onOpenSettings={() => setLoginMode('change-password')}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">

        {/* Welcome Section */}
        <section className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {getGreeting()}, <span className="text-primary">{isAuthenticated ? getDisplayName() : 'User'}</span>!
          </h2>
          <p className="text-muted-foreground">{t('greeting.subtitle')}</p>
        </section>

        {/* Login Prompt for unauthenticated users */}
        {!authLoading && !isAuthenticated && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">
                {language === 'ur' ? 'اپنے ٹاسک محفوظ کرنے کے لیے سائن ان کریں' : 'Sign in to save your tasks'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === 'ur' ? 'آپ کے ٹاسک تمام ڈیوائسز پر سنک ہوں گے' : 'Your tasks will sync across all devices'}
              </p>
            </div>
            <button
              onClick={() => setLoginMode('login')}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {language === 'ur' ? 'سائن ان' : 'Sign In'}
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-sm flex items-center gap-3">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* AI Insights */}
        <AIInsights tasks={tasks} />

        {/* Create Task */}
        <TaskForm onSubmit={handleCreate} />

        {/* Search & Filter */}
        <SearchFilter onSearch={handleSearch} />

        {/* Tasks List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xl flex items-center gap-3">
              {t('tasks.my')}
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {filteredTasks.filter(t => !t.completed).length} {t('tasks.pending')}
              </span>
            </h3>
          </div>

          <TaskList
            tasks={filteredTasks}
            loading={loading}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </section>

      </main>

      {/* Floating AI Chat Widget */}
      <AIChatWidget onTaskAction={fetchTasks} />

      {/* Login Modal */}
      <LoginModal
        isOpen={!!loginMode}
        onClose={() => setLoginMode(null)}
        initialMode={loginMode || 'login'}
      />
    </div>
  );
}
