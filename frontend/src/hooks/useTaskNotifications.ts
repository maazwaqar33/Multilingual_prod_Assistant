import { useEffect, useRef } from 'react';
import { Task } from '@/types';

export function useTaskNotifications(tasks: Task[]) {
    const notifiedTasks = useRef<Set<number>>(new Set());

    useEffect(() => {
        // Request permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        const checkTasks = () => {
            const now = new Date();

            tasks.forEach(task => {
                if (!task.due_date || task.completed) return;

                const dueDate = new Date(task.due_date);
                const timeDiff = dueDate.getTime() - now.getTime();
                const minutesDiff = timeDiff / (1000 * 60);

                // Notify if due within 15 minutes and not already notified this session
                if (minutesDiff > 0 && minutesDiff <= 15 && !notifiedTasks.current.has(task.id)) {
                    new Notification(`Task Due Soon: ${task.title}`, {
                        body: `This task is due in ${Math.round(minutesDiff)} minutes!`,
                        icon: '/icon.png' // Optional fallback
                    });

                    notifiedTasks.current.add(task.id);
                }
            });
        };

        // Check initially
        checkTasks();

        // Check every minute
        const intervalId = setInterval(checkTasks, 60000);

        return () => clearInterval(intervalId);
    }, [tasks]);
}
