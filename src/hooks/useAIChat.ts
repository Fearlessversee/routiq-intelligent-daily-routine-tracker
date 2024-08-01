import { useState, useCallback, useEffect } from 'react';
import { SYSTEM_PROMPT } from '@/lib/constants';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

const STORAGE_KEY = 'ai_dost_chat_history';

export const useAIChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }, [messages]);

    const sendMessage = useCallback(async (content: string, contextTasks?: any[]) => {
        if (!content.trim()) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const apiKey = import.meta.env.VITE_GROQ_API_KEY;
            if (!apiKey) throw new Error('Groq API Key missing');

            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

            const tasksContext = contextTasks ?
                `Current Tasks Schedule:\n${contextTasks.map(t => `- ${t.time}: ${t.task_name}`).join('\n')}` :
                'No specific tasks loaded.';

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: `${SYSTEM_PROMPT}\n\nCurrent Time: ${currentTime}\n${tasksContext}`
                        },
                        ...messages.slice(-20).map(m => ({ role: m.role, content: m.content })),
                        { role: "user", content }
                    ],
                    temperature: 0.7,
                }),
            });

            if (!response.ok) throw new Error('AI request failed');

            const data = await response.json();
            const assistantContent = data.choices?.[0]?.message?.content || "Maaf karna bhai, kuch error aa gaya.";

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: assistantContent,
                timestamp: Date.now(),
            };

            setMessages(prev => [...prev, assistantMessage]);
            return assistantContent;
        } catch (error) {
            console.error('Chat error:', error);
            return "Bhai, network ya API ka kuch issue lag raha hai.";
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    const clearHistory = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        sendMessage,
        clearHistory,
        isLoading
    };
};
