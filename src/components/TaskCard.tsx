import { Task } from '@/types/routine';
import { Button } from '@/components/ui/button';
import { Check, SkipForward, Volume2, Clock, Trash2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback, memo } from 'react';

interface TaskCardProps {
  task: Task & { status: string };
  isActive: boolean;
  isSpeaking: boolean;
  onDone: () => void;
  onSkip: () => void;
  onReset?: () => void;
  onDelete?: () => void;
  onPlayVoice?: (voiceText: string) => void;
  onStopVoice?: () => void;
}

export const TaskCard = memo(({
  task,
  isActive,
  isSpeaking,
  onDone,
  onSkip,
  onReset,
  onDelete,
  onPlayVoice,
  onStopVoice
}: TaskCardProps) => {
  const isPending = task.status === 'pending';
  const isDone = task.status === 'done';
  const isSkipped = task.status === 'skip';
  const isThisTaskSpeaking = isActive && isSpeaking;

  const handleSpeakerClick = useCallback(() => {
    if (isThisTaskSpeaking) {
      onStopVoice?.();
    } else {
      onPlayVoice?.(task.voice_text);
    }
  }, [isThisTaskSpeaking, onPlayVoice, onStopVoice, task.voice_text]);

  return (
    <div
      className={cn(
        "relative p-5 rounded-[2rem] transition-all duration-500 group overflow-hidden",
        isThisTaskSpeaking
          ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/40 shadow-2xl shadow-primary/20 scale-[1.02]"
          : isPending
            ? "glass hover:bg-card/90 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
            : isDone
              ? "bg-success/10 border border-success/20 opacity-80"
              : "bg-muted/10 border border-border/10 opacity-60"
      )}
    >
      {/* Dynamic background glow */}
      {isThisTaskSpeaking && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-shimmer pointer-events-none" />
      )}

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Action Button / Speaker */}
          <button
            onClick={handleSpeakerClick}
            className={cn(
              "shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500",
              isThisTaskSpeaking
                ? "bg-primary text-white shadow-lg shadow-primary/30 animate-pulse"
                : "bg-secondary/80 text-primary hover:bg-primary hover:text-white"
            )}
          >
            {isThisTaskSpeaking ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={cn(
                "px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1",
                isThisTaskSpeaking ? "bg-primary text-white" : "bg-primary/10 text-primary"
              )}>
                <Clock className="w-3 h-3" />
                {task.time}
              </div>
              {isThisTaskSpeaking && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
            </div>
            <h3 className={cn(
              "font-bold text-lg sm:text-xl tracking-tight truncate transition-all duration-300",
              (isDone || isSkipped) && "line-through text-muted-foreground opacity-50"
            )}>
              {task.task_name}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isPending ? (
            <>
              <Button
                variant="success"
                onClick={onDone}
                className="h-12 px-4 sm:px-6 rounded-2xl font-bold shadow-lg shadow-success/10 hover:scale-105 active:scale-95 transition-all text-sm sm:text-base"
              >
                <Check className="w-5 h-5 mr-1 sm:mr-2" />
                Done
              </Button>
              <Button
                variant="secondary"
                onClick={onSkip}
                className="h-12 w-12 p-0 rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm",
                isDone ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
              )}>
                {isDone ? <Check className="w-4 h-4" /> : <SkipForward className="w-4 h-4" />}
                {isDone ? 'COMPLETE' : 'SKIPPED'}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onReset}
                className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                title="Undone"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
          {onDelete && isPending && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-12 w-12 rounded-2xl opacity-40 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
