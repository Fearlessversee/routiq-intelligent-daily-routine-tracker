import { useEffect, useRef, useCallback } from 'react';
import { Task } from '@/types/routine';

interface SchedulerProps {
  tasks: Task[];
  todayStatuses: Record<string, { status: string }>;
  onReminder: (task: Task) => void;
}

export const useScheduler = ({ tasks, todayStatuses, onReminder }: SchedulerProps) => {
  const triggeredRef = useRef<Set<string>>(new Set());
  const dateRef = useRef<string>(new Date().toISOString().split('T')[0]);

  const checkTasks = useCallback(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Reset triggered set if it's a new day
    if (dateRef.current !== today) {
      triggeredRef.current.clear();
      dateRef.current = today;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    tasks.forEach(task => {
      // Skip if already completed today
      if (todayStatuses[task.id]?.status && todayStatuses[task.id].status !== 'pending') {
        return;
      }

      // Skip if already triggered today
      if (triggeredRef.current.has(task.id)) {
        return;
      }

      const [hours, minutes] = task.time.split(':').map(Number);
      const taskMinutes = hours * 60 + minutes;
      const reminderTime = taskMinutes - task.remind_before;

      // Trigger if we're at or past the reminder time but before task time
      if (currentMinutes >= reminderTime && currentMinutes < taskMinutes + 5) {
        triggeredRef.current.add(task.id);
        onReminder(task);
      }
    });
  }, [tasks, todayStatuses, onReminder]);

  useEffect(() => {
    // Check immediately on mount
    checkTasks();
    
    // Check every 30 seconds
    const interval = setInterval(checkTasks, 30000);
    
    return () => clearInterval(interval);
  }, [checkTasks]);

  const resetTriggered = useCallback((taskId: string) => {
    triggeredRef.current.delete(taskId);
  }, []);

  return { resetTriggered };
};
