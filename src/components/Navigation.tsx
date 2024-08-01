import { cn } from '@/lib/utils';
import { Calendar, Sparkles, TrendingUp, Volume2 } from 'lucide-react';
import type { ReactNode } from 'react';

type Tab = 'today' | 'ai' | 'chat' | 'progress';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isSpeaking: boolean;
}

export const Navigation = ({ activeTab, onTabChange, isSpeaking }: NavigationProps) => {
  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: 'today', label: 'Today', icon: <Calendar className="w-5 h-5" /> },
    { id: 'ai', label: 'Create', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'chat', label: 'Dost', icon: <Volume2 className="w-5 h-5" /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp className="w-5 h-5" /> }
  ];

  return (
    <nav className="fixed bottom-0 sm:bottom-6 left-0 right-0 z-50 flex justify-center px-2 pb-[var(--sab)] sm:pb-0 animate-slide-in pointer-events-none">
      <div className="glass-premium rounded-[1.8rem] sm:rounded-[2rem] p-1 sm:p-1.5 flex items-center shadow-2xl shadow-primary/20 pointer-events-auto border-primary/20 max-w-[95vw] overflow-x-auto sm:overflow-x-visible no-scrollbar">
        <div className="flex items-center gap-0.5 sm:gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-[1.3rem] sm:rounded-[1.5rem] transition-all duration-500 overflow-hidden shrink-0",
                activeTab === tab.id
                  ? "text-white"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent animate-fade-in" />
              )}
              <span className="relative z-10 scale-90 sm:scale-100">{tab.icon}</span>
              <span className="relative z-10 text-[10px] sm:text-xs font-bold uppercase tracking-widest hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Speaking indicator - floating above navigation */}
      {isSpeaking && (
        <div className="fixed top-6 right-6 flex items-center gap-3 glass-premium px-5 py-3 rounded-full text-primary border-primary/30 shadow-xl shadow-primary/20 animate-glow">
          <div className="flex gap-1 items-center">
            <span className="w-1 h-3 bg-primary rounded-full animate-pulse"></span>
            <span className="w-1 h-5 bg-primary rounded-full animate-pulse delay-75"></span>
            <span className="w-1 h-3 bg-primary rounded-full animate-pulse delay-150"></span>
          </div>
          <span className="text-sm font-black tracking-tighter italic">SPEAKING</span>
        </div>
      )}
    </nav>
  );
};
