import { useState, useEffect, useCallback, useRef } from 'react';

export const useWakeWord = (onWake: (transcript: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const [error, setError] = useState<string | null>(null);
    const lastStartAttempt = useRef<number>(0);

    const stopListening = useCallback(() => {
        setIsListening(false);
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onend = null; // Prevent auto-restart on manual stop
                recognitionRef.current.onerror = null;
                recognitionRef.current.stop();
            } catch (e) {
                console.error('Stop failed:', e);
            }
            recognitionRef.current = null;
        }
    }, []);

    const startListening = useCallback(() => {
        // Prevent rapid restart loops
        const now = Date.now();
        if (now - lastStartAttempt.current < 1000) return;
        lastStartAttempt.current = now;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition not supported');
            return;
        }

        if (recognitionRef.current) {
            try {
                recognitionRef.current.onend = null;
                recognitionRef.current.stop();
            } catch (e) { }
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'hi-IN';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event: any) => {
            const results = event.results;
            const lastResult = results[results.length - 1];
            if (!lastResult.isFinal) return;

            const transcript = lastResult[0].transcript.toLowerCase();
            console.log('Transcript:', transcript);

            const wakeWords = ['dost', 'hello dost', 'wake up', 'bhai'];
            const heardWakeWord = wakeWords.some(word => transcript.includes(word));

            if (heardWakeWord) {
                let cleanTranscript = transcript;
                for (const word of wakeWords) {
                    if (transcript.includes(word)) {
                        const parts = transcript.split(word);
                        cleanTranscript = parts[parts.length - 1] || '';
                        break;
                    }
                }

                // Call stop first to prevent feedback loop
                stopListening();
                onWake(cleanTranscript.trim());
            }
        };

        recognition.onerror = (event: any) => {
            console.warn('Speech recognition error:', event.error);
            if (event.error === 'aborted') return; // Ignore manual aborts

            setError(event.error);
            if (event.error === 'no-speech' || event.error === 'network') {
                // Silently try to restart after a longer delay for network/voice issues
                setTimeout(() => {
                    // Only restart if the user still wants to listen
                    if (recognitionRef.current === null && !isListening) {
                        // This bit is tricky, let's just let onend handle it
                    }
                }, 2000);
            }
        };

        recognition.onend = () => {
            recognitionRef.current = null;
            // If it ended naturally (not via stopListening) and we want it to be active
            // but we need to check the state. We'll rely on the isListening state.
            // But be careful of loops.
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
        } catch (e) {
            console.error('Recognition start failed:', e);
        }
    }, [onWake, stopListening]); // Removed isListening from dependencies to avoid loop

    // Helper to keep it alive
    useEffect(() => {
        let interval: number;
        if (isListening) {
            interval = window.setInterval(() => {
                if (!recognitionRef.current) {
                    startListening();
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isListening, startListening]);

    return {
        isListening,
        startListening,
        stopListening,
        error
    };
};
