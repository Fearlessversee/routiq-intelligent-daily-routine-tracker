import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus, RoutineState, DailyStats } from '@/types/routine';

const STORAGE_KEY = 'routine_assistant_data';

const getToday = () => new Date().toISOString().split('T')[0];

const defaultTasks: Task[] = [
  {
    id: 'diet-1',
    task_name: 'Subah Foundation (Banana + Milk)',
    time: '04:30',
    remind_before: 5,
    voice_text: 'Bhai, 4:30 baj gaye hain. 1 kela aur 1 glass doodh pi lo, hair roots ke liye zaroori hai!'
  },
  {
    id: 'diet-2',
    task_name: 'Main Protein (Soybean/Channa)',
    time: '10:30',
    remind_before: 10,
    voice_text: 'Bhai, 10:30 ka time hai. Soybean ki sabji ya Kala Channa kha lo. Ye protein muscle aur hair structure ke liye sabse important hai!'
  },
  {
    id: 'diet-3',
    task_name: 'Weight Builder (Rice + Potato)',
    time: '14:30',
    remind_before: 5,
    voice_text: 'Dopahar ka time! Chawal aur aalo ki sabji khao weight gain ke liye. Hair ke liye biotin bhi milega.'
  },
  {
    id: 'diet-4',
    task_name: 'Recovery Shake',
    time: '17:30',
    remind_before: 5,
    voice_text: 'Recovery time! Doodh, kela, badam, kishmish aur moongfali wala shake bana lo. Iron aur zinc booster hai ye!'
  },
  {
    id: 'diet-5',
    task_name: 'Stable Weight Dinner',
    time: '20:30',
    remind_before: 5,
    voice_text: 'Raat ka khana! 2 roti aur Soybean ya Channa sabji. Sone se pehle body ko fuel milna chahiye.'
  },
  {
    id: 'diet-6',
    task_name: 'Healing Milk (Haldi Milk)',
    time: '22:30',
    remind_before: 5,
    voice_text: 'Sone ka time ho gaya. Haldi wala garam doodh pi lo deep recovery aur hair support ke liye. Shubh ratri!'
  },
];

export const useRoutine = () => {
  const [state, setState] = useState<RoutineState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Reset today's statuses if it's a new day
      const today = getToday();
      if (Object.keys(parsed.todayStatuses || {}).length > 0) {
        const firstStatus = Object.values(parsed.todayStatuses)[0] as TaskStatus;
        if (firstStatus?.date !== today) {
          return {
            ...parsed,
            todayStatuses: {}
          };
        }
      }
      return parsed;
    }
    return {
      tasks: defaultTasks,
      todayStatuses: {},
      history: []
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getTodayTasks = useCallback(() => {
    const today = getToday();
    return state.tasks.map(task => ({
      ...task,
      status: state.todayStatuses[task.id]?.status || 'pending'
    })).sort((a, b) => a.time.localeCompare(b.time));
  }, [state.tasks, state.todayStatuses]);

  const markTask = useCallback((taskId: string, status: 'done' | 'skip') => {
    const today = getToday();
    const taskStatus: TaskStatus = {
      taskId,
      date: today,
      status,
      completedAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      todayStatuses: {
        ...prev.todayStatuses,
        [taskId]: taskStatus
      },
      history: [...prev.history, taskStatus]
    }));
  }, []);

  const resetTask = useCallback((taskId: string) => {
    setState(prev => {
      const newTodayStatuses = { ...prev.todayStatuses };
      delete newTodayStatuses[taskId];

      return {
        ...prev,
        todayStatuses: newTodayStatuses,
        // Also remove the last status from history for this task today
        history: prev.history.filter(h => !(h.taskId === taskId && h.date === getToday()))
      };
    });
  }, []);

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString()
    };
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  }, []);

  const setTasks = useCallback((tasks: Task[]) => {
    setState(prev => ({
      ...prev,
      tasks
    }));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
  }, []);

  const getStats = useCallback((): DailyStats[] => {
    const statsMap: Record<string, DailyStats> = {};

    state.history.forEach(status => {
      if (!statsMap[status.date]) {
        statsMap[status.date] = {
          date: status.date,
          done: 0,
          skip: 0,
          total: 0,
          percentage: 0
        };
      }
      statsMap[status.date].total++;
      if (status.status === 'done') {
        statsMap[status.date].done++;
      } else if (status.status === 'skip') {
        statsMap[status.date].skip++;
      }
    });

    // Add today's stats
    const today = getToday();
    const todayDone = Object.values(state.todayStatuses).filter(s => s.status === 'done').length;
    const todaySkip = Object.values(state.todayStatuses).filter(s => s.status === 'skip').length;
    const todayTotal = todayDone + todaySkip;

    if (todayTotal > 0) {
      statsMap[today] = {
        date: today,
        done: todayDone,
        skip: todaySkip,
        total: todayTotal,
        percentage: Math.round((todayDone / todayTotal) * 100)
      };
    }

    Object.keys(statsMap).forEach(date => {
      const stat = statsMap[date];
      stat.percentage = stat.total > 0 ? Math.round((stat.done / stat.total) * 100) : 0;
    });

    return Object.values(statsMap).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  }, [state.history, state.todayStatuses]);

  const getTodayProgress = useCallback(() => {
    const total = state.tasks.length;
    const done = Object.values(state.todayStatuses).filter(s => s.status === 'done').length;
    const skip = Object.values(state.todayStatuses).filter(s => s.status === 'skip').length;
    return {
      total,
      done,
      skip,
      pending: total - done - skip,
      percentage: total > 0 ? Math.round((done / total) * 100) : 0
    };
  }, [state.tasks, state.todayStatuses]);

  return {
    tasks: state.tasks,
    getTodayTasks,
    markTask,
    addTask,
    setTasks,
    deleteTask,
    resetTask,
    getStats,
    getTodayProgress
  };
};
