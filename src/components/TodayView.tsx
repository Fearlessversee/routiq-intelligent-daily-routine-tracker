import { Task } from '@/types/routine';
import { TaskCard } from './TaskCard';
import { Calendar, Sun, Zap, Flame } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useState, memo, useMemo } from 'react';

interface TodayViewProps {
  tasks: (Task & { status: string })[];
  activeTaskId: string | null;
  isSpeaking: boolean;
  onDone: (taskId: string) => void;
  onSkip: (taskId: string) => void;
  onReset: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onPlayVoice: (taskId: string, voiceText: string) => void;
  onStopVoice: () => void;
  progress: {
    total: number;
    done: number;
    skip: number;
    pending: number;
    percentage: number;
  };
}

export const TodayView = memo(({
  tasks,
  activeTaskId,
  isSpeaking,
  onDone,
  onSkip,
  onReset,
  onDelete,
  onPlayVoice,
  onStopVoice,
  progress
}: TodayViewProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const today = date || new Date();
  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between pt-2 sm:pt-4 gap-2">
        <div className="space-y-1 sm:space-y-2 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-primary/80 text-[10px] sm:text-sm font-semibold tracking-wider uppercase">
            <Calendar className="w-3 h-3 sm:w-4 h-4" />
            <span className="truncate">{dateStr}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter leading-[0.9]">
            <span className="text-gradient">Daily</span>
            <br />
            <span className="text-foreground">Routine</span>
          </h1>
        </div>

        <div className="flex gap-1.5 sm:gap-2 pb-1 shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-primary/20 bg-secondary/30 hover:bg-primary/10 transition-all shadow-xl"
              >
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-screen sm:w-auto p-0 glass-premium border-primary/20 rounded-3xl" align="end">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="bg-transparent"
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-destructive/20 bg-secondary/30 hover:bg-destructive/10 transition-all shadow-xl"
            onClick={() => {
              if (confirm("Reset all tasks for today?")) {
                tasks.forEach(task => onReset(task.id));
              }
            }}
            title="Reset Day"
          >
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="glass-premium p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] glow-premium border-primary/20 bg-gradient-to-br from-card to-card/50">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 sm:scale-110">
              <Flame className="w-5 h-5 sm:w-7 sm:h-7 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest leading-none">Efficiency</p>
              <p className="text-2xl sm:text-4xl font-black text-gradient leading-none mt-1">{progress.percentage}%</p>
            </div>
          </div>
          <div className="text-right flex flex-col gap-1 sm:gap-1.5 shrink-0">
            <div className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-success/10 border border-success/20 flex items-center gap-1.5">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-success" />
              <span className="text-success text-[10px] font-bold">{progress.done} DONE</span>
            </div>
            <div className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-1.5">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary" />
              <span className="text-primary text-[10px] font-bold">{progress.pending} LEFT</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 sm:h-4 bg-secondary/50 rounded-full overflow-hidden p-0.5 sm:p-1 border border-border/50">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-1000 ease-out animate-shimmer"
            style={{
              width: `${progress.percentage}%`,
              backgroundSize: '200% 100%'
            }}
          />
        </div>
      </div>


      {/* Task list */}
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="animate-slide-in"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <TaskCard
              task={task}
              isActive={activeTaskId === task.id}
              isSpeaking={isSpeaking && activeTaskId === task.id}
              onDone={() => onDone(task.id)}
              onSkip={() => onSkip(task.id)}
              onReset={() => onReset?.(task.id)}
              onDelete={() => onDelete(task.id)}
              onPlayVoice={(voiceText) => onPlayVoice(task.id, voiceText)}
              onStopVoice={onStopVoice}
            />
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="glass-premium p-10 rounded-3xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Tasks Yet</h3>
          <p className="text-muted-foreground">
            Create your routine with AI to get started
          </p>
        </div>
      )}
    </div>
  );
});
