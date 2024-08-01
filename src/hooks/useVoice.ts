import { useState, useRef, useCallback, useEffect } from 'react';

export const useVoice = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const intervalRef = useRef<number | null>(null);

    // Initialize voices
    useEffect(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!text || !('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        setIsSpeaking(true);

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();

        // Find best Hindi voice
        const hindiVoice =
            voices.find(v => (v.lang.includes('hi-IN') || v.lang.includes('hi_IN')) && v.name.includes('Google')) ||
            voices.find(v => v.lang.includes('hi')) ||
            voices.find(v => v.name.toLowerCase().includes('hindi')) ||
            voices[0];

        if (hindiVoice) {
            utterance.voice = hindiVoice;
        }

        utterance.lang = 'hi-IN';
        utterance.rate = 1.0;
        utterance.pitch = 1.1;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    const startReminder = useCallback((taskId: string, voiceText: string) => {
        setIsSpeaking(true);
        setCurrentTaskId(taskId);
        speak(voiceText);

        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => speak(voiceText), 30000);
    }, [speak]);

    const stopReminder = useCallback(() => {
        setIsSpeaking(false);
        setCurrentTaskId(null);
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }, []);

    useEffect(() => {
        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        };
    }, []);

    return {
        isSpeaking,
        currentTaskId,
        isLoading,
        error: null,
        startReminder,
        stopReminder,
        speak
    };
};
