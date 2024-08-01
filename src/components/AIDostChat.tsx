import { useState, useEffect, useRef } from 'react';
import { useAIChat, ChatMessage } from '@/hooks/useAIChat';
import { useVoice } from '@/hooks/useVoice';
import { useWakeWord } from '@/hooks/useWakeWord';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, Sparkles, Trash2, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { Task } from '@/types/routine';

export const AIDostChat = ({ tasks }: { tasks: Task[] }) => {
    const { messages, sendMessage, clearHistory, isLoading: aiLoading } = useAIChat();
    const { speak, isSpeaking, stopReminder, error: voiceError } = useVoice();
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleWake = async (transcript: string) => {
        if (transcript) {
            toast.info("Dost is listening...");
            const response = await sendMessage(transcript, tasks);
            if (response) {
                speak(response);
            }
        } else {
            // Just a toast, no voice, to prevent feedback loop
            toast.info("Dost: Ji bhai, boliye?");
        }
    };

    const { isListening, startListening, stopListening } = useWakeWord(handleWake);

    // Persistent notification for listening state
    useEffect(() => {
        if (isListening && 'serviceWorker' in navigator && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification("AI Dost Sun Raha Hai...", {
                    body: "Hum hamesha taiyar hain bhai! 'Wake Up' bolkar baat shuru karein.",
                    icon: '/favicon.png',
                    badge: '/favicon.png',
                    tag: 'listening-status',
                    silent: true,
                    sticky: true as any // Some browsers support this loosely
                } as any);
            });
        }
    }, [isListening]);

    const handleSend = async () => {
        if (!inputText.trim()) return;
        const text = inputText;
        setInputText('');
        const response = await sendMessage(text, tasks);
        if (response) {
            speak(response);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Resume listening after speaking finishes
    useEffect(() => {
        if (!isSpeaking && !aiLoading && isListening) {
            startListening();
        }
    }, [isSpeaking, aiLoading, isListening, startListening]);

    return (
        <div className="flex flex-col h-[75vh] sm:h-[70vh] space-y-4 animate-fade-in chat-container">
            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-gradient uppercase italic flex items-center gap-2">
                        <Brain className="w-6 h-6 sm:w-8 h-8 text-primary" /> AI DOST
                    </h2>
                    <p className="text-muted-foreground text-[10px] sm:text-xs font-medium tracking-wide">
                        Weight Gain & Hair Health Expert
                    </p>
                </div>
                <div className="flex gap-1 sm:gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearHistory}
                        className="rounded-full h-9 w-9 sm:h-10 sm:w-10 hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="w-4 h-4 sm:w-5 h-5" />
                    </Button>
                    <Button
                        variant={isListening ? "glow" : "outline"}
                        size="icon"
                        onClick={isListening ? stopListening : startListening}
                        className={cn(
                            "rounded-full h-9 w-9 sm:h-10 sm:w-10 transition-all duration-500",
                            isListening && "animate-pulse"
                        )}
                    >
                        {isListening ? <Mic className="w-4 h-4 sm:w-5 h-5" /> : <MicOff className="w-4 h-4 sm:w-5 h-5" />}
                    </Button>
                </div>
            </div>

            <div className="flex-1 glass-premium rounded-[2rem] sm:rounded-[2.5rem] border-primary/20 bg-gradient-to-br from-card/50 to-card/30 shadow-2xl overflow-hidden relative">
                <div className="h-full p-4 sm:p-6 overflow-y-auto" ref={scrollRef}>
                    <div className="space-y-4 pb-4">
                        {voiceError && (
                            <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-xl text-[10px] sm:text-xs text-destructive animate-pulse mb-4">
                                ⚠️ {voiceError}
                            </div>
                        )}
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-[40vh] text-center space-y-4 opacity-50">
                                <Sparkles className="w-10 h-10 sm:w-12 h-12 text-primary animate-pulse" />
                                <p className="text-xs sm:text-sm font-medium">Bolo bhai, kuch bhi pucho!<br />"Wake Up" bolkar bhi baat shuru kar sakte ho.</p>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex flex-col max-w-[90%] sm:max-w-[85%] space-y-1",
                                    m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-3 sm:p-4 rounded-2xl text-xs sm:text-sm font-medium shadow-sm",
                                        m.role === 'user'
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-secondary/80 text-foreground rounded-tl-none border border-white/5"
                                    )}
                                >
                                    {m.content}
                                </div>
                                <span className="text-[9px] sm:text-[10px] text-muted-foreground/50 px-1 italic">
                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                        {aiLoading && (
                            <div className="flex mr-auto items-start">
                                <div className="bg-secondary/80 p-3 sm:p-4 rounded-2xl rounded-tl-none border border-white/5 animate-pulse flex gap-1.5 sm:gap-2">
                                    <div className="w-1.5 h-1.5 sm:w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 sm:w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 sm:w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-2 items-center bg-card/30 p-1.5 sm:p-2 rounded-[1.5rem] sm:rounded-3xl border border-white/5 backdrop-blur-md">
                <Input
                    placeholder="Baat karo Dost se..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="bg-transparent border-none focus-visible:ring-0 text-sm sm:text-base py-3 sm:py-6 h-auto"
                />
                <Button
                    onClick={handleSend}
                    disabled={aiLoading || !inputText.trim()}
                    variant="glow"
                    size="icon"
                    className="rounded-xl sm:rounded-2xl h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
                >
                    <Send className="w-4 h-4 sm:w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};
