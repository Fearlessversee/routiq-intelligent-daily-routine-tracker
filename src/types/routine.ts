export interface Task {
  id: string;
  task_name: string;
  time: string; // HH:MM 24h format
  remind_before: number; // minutes
  voice_text: string;
}

export interface TaskStatus {
  taskId: string;
  date: string; // YYYY-MM-DD
  status: 'done' | 'skip' | 'pending';
  completedAt?: string;
}

export interface DailyStats {
  date: string;
  done: number;
  skip: number;
  total: number;
  percentage: number;
}

export interface RoutineState {
  tasks: Task[];
  todayStatuses: Record<string, TaskStatus>;
  history: TaskStatus[];
}
