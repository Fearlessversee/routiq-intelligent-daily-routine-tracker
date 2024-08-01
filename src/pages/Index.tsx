import { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { useRoutine } from '@/hooks/useRoutine';
import { useVoice } from '@/hooks/useVoice';
import { useNotification } from '@/hooks/useNotification';
import { useScheduler } from '@/hooks/useScheduler';
import { useWakeLock } from '@/hooks/useWakeLock';
import { Navigation } from '@/components/Navigation';
import { TodayView } from '@/components/TodayView';
import { Task } from '@/types/routine';
import { toast } from 'sonner';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstallPWA } from '@/components/InstallPWA';

// Lazy load non-critical components
const AIRoutineEditor = lazy(() => import('@/components/AIRoutineEditor').then(m => ({ default: m.AIRoutineEditor })));
const AIDostChat = lazy(() => import('@/components/AIDostChat').then(m => ({ default: m.AIDostChat })));
const ProgressCharts = lazy(() => import('@/components/ProgressCharts').then(m => ({ default: m.ProgressCharts })));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 animate-fade-in">
    <Loader2 className="w-10 h-10 text-primary animate-spin" />
    <p className="text-sm font-bold tracking-widest uppercase opacity-50">Loading Brain...</p>
  </div>
);

type Tab = 'today' | 'ai' | 'chat' | 'progress';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [showSettings, setShowSettings] = useState(false);

  const {
    tasks,
    getTodayTasks,
    markTask,
    setTasks,
    deleteTask,
    resetTask,
    getStats,
    getTodayProgress
  } = useRoutine();

  const handleReset = useCallback((taskId: string) => {
    resetTask(taskId);
    toast('Task status cleared');
  }, [resetTask]);

  const { isSpeaking, currentTaskId, startReminder, stopReminder, isLoading: voiceLoading } = useVoice();
  const { permission, requestPermission, sendNotification } = useNotification();

  const todayTasks = getTodayTasks();
  const todayStatuses = todayTasks.reduce((acc, task) => {
    acc[task.id] = { status: task.status };
    return acc;
  }, {} as Record<string, { status: string }>);

  const handleReminder = useCallback((task: Task) => {
    // Start voice reminder
    startReminder(task.id, task.voice_text);

    // Send notification
    sendNotification(
      `⏰ ${task.task_name}`,
      task.voice_text
    );

    // Switch to today view
    setActiveTab('today');

    toast.info(`Reminder: ${task.task_name}`, {
      duration: 10000
    });
  }, [startReminder, sendNotification]);

  useScheduler({
    tasks,
    todayStatuses,
    onReminder: handleReminder
  });

  const handleDone = useCallback((taskId: string) => {
    stopReminder();
    markTask(taskId, 'done');
    toast.success('Task completed! 🎉');
  }, [stopReminder, markTask]);

  const handleSkip = useCallback((taskId: string) => {
    stopReminder();
    markTask(taskId, 'skip');
    toast('Task skipped');
  }, [stopReminder, markTask]);

  const handleDelete = useCallback((taskId: string) => {
    deleteTask(taskId);
    toast('Task deleted');
  }, [deleteTask]);

  const handlePlayVoice = useCallback((taskId: string, voiceText: string) => {
    startReminder(taskId, voiceText);
  }, [startReminder]);

  const handleStopVoice = useCallback(() => {
    stopReminder();
  }, [stopReminder]);

  const handleSaveTasks = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    setActiveTab('today');
  }, [setTasks]);

  const { requestWakeLock } = useWakeLock();

  // Request notification permission and wake lock on mount
  useEffect(() => {
    requestWakeLock();
    if (permission === 'default') {
      // Don't auto-request, show a button instead
    }
  }, [permission, requestWakeLock]);

  return (
    <div className="min-h-screen bg-background pb-32 sm:pb-6 overflow-x-hidden pt-[var(--sat)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Background gradient mesh effect */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-6 sm:px-10 py-4 sm:py-8 space-y-6">
        <InstallPWA />
        {/* Header with Navigation */}
        <div className="flex items-center justify-center">
          <div className="w-full">
            <Navigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isSpeaking={isSpeaking}
            />
          </div>
        </div>

        {/* Notification permission banner */}
        {permission === 'default' && (
          <div className="glass-premium p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Enable notifications for reminders</span>
            </div>
            <Button
              variant="glow"
              size="sm"
              className="rounded-xl"
              onClick={async () => {
                const granted = await requestPermission();
                if (granted) {
                  toast.success('Notifications enabled!');
                }
              }}
            >
              Enable
            </Button>
          </div>
        )}

        {/* Main content */}
        <main className="pt-2">
          <Suspense fallback={<PageLoader />}>
            {activeTab === 'today' && (
              <TodayView
                tasks={todayTasks}
                activeTaskId={currentTaskId}
                isSpeaking={isSpeaking}
                onDone={handleDone}
                onSkip={handleSkip}
                onReset={handleReset}
                onDelete={handleDelete}
                onPlayVoice={handlePlayVoice}
                onStopVoice={handleStopVoice}
                progress={getTodayProgress()}
              />
            )}

            {activeTab === 'ai' && (
              <AIRoutineEditor
                onSave={handleSaveTasks}
                existingTasks={tasks}
              />
            )}

            {activeTab === 'chat' && (
              <AIDostChat tasks={tasks} />
            )}

            {activeTab === 'progress' && (
              <ProgressCharts
                stats={getStats()}
                todayProgress={getTodayProgress()}
              />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Index;
