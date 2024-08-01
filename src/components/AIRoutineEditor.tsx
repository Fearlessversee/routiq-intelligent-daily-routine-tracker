import { useState } from 'react';
import { Task } from '@/types/routine';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Check, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';


interface AIRoutineEditorProps {
  onSave: (tasks: Task[]) => void;
  existingTasks: Task[];
}

export const AIRoutineEditor = ({
  onSave,
  existingTasks
}: AIRoutineEditorProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<Omit<Task, 'id'>[]>([]);

  const generateRoutine = async () => {
    if (!input.trim()) {
      toast.error('Please describe your routine');
      return;
    }

    setIsLoading(true);
    setPreview([]);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('Groq API Key missing! Please add it to .env');
      }

      const systemPrompt = `You are a routine assistant. Convert the following natural language routine description into a structured JSON array. 

Return ONLY a valid JSON array with this exact format, no explanations:
[
  {
    "task_name": "Task Name",
    "time": "HH:MM",
    "remind_before": 5,
    "voice_text": "Hindi/Hinglish reminder message"
  }
]

Rules:
- Time must be in 24-hour format (HH:MM)
- remind_before is in minutes (default 5)
- voice_text should be friendly Hindi/Hinglish
- Sort tasks by time
- Be practical and realistic with times`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `User's routine description (in Hindi/Hinglish): "${input}"` },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Groq API request failed');
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      // Extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Could not parse routine from AI response");
      }

      const tasks = JSON.parse(jsonMatch[0]);

      if (tasks.length === 0) {
        toast.error('Could not parse routine. Please try again.');
        return;
      }

      setPreview(tasks.map((item: any) => ({
        task_name: item.task_name || item.name || 'Task',
        time: item.time || '09:00',
        remind_before: item.remind_before || 5,
        voice_text: item.voice_text || `${item.task_name || item.name} ka time ho gaya hai!`
      })));

      toast.success(`Generated ${tasks.length} tasks!`);
    } catch (error: any) {
      console.error('AI error:', error);
      toast.error(error.message || 'Failed to generate routine');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    const newTasks: Task[] = preview.map((task, index) => ({
      ...task,
      id: `ai-${Date.now()}-${index}`
    }));
    onSave([...existingTasks, ...newTasks]);
    setPreview([]);
    setInput('');
    toast.success('Routine saved!');
  };

  const handleReplaceAll = () => {
    const newTasks: Task[] = preview.map((task, index) => ({
      ...task,
      id: `ai-${Date.now()}-${index}`
    }));
    onSave(newTasks);
    setPreview([]);
    setInput('');
    toast.success('Routine replaced!');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="space-y-1 sm:space-y-2">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-gradient uppercase italic">AI Routine</h2>
        <p className="text-muted-foreground text-xs sm:text-sm font-medium tracking-wide">
          Describe your day and let the AI do the magic
        </p>
      </div>

      <div className="glass-premium p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border-primary/20 bg-gradient-to-br from-card to-card/50 shadow-2xl shadow-primary/10">
        <div className="relative">
          <Textarea
            placeholder="e.g., Morning 7 am gym, 9 am office, 1 pm lunch, 10 pm sleep..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] sm:min-h-[160px] bg-secondary/30 border-none rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-base sm:text-lg focus-visible:ring-primary/30 placeholder:text-muted-foreground/40 resize-none"
          />
          {!import.meta.env.VITE_GROQ_API_KEY && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center">
              <div className="space-y-4">
                <p className="text-destructive font-black uppercase tracking-tighter italic">Grok API Key Missing</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Please add <code className="bg-secondary px-1 font-mono">VITE_GROQ_API_KEY</code> to your <code className="bg-secondary px-1 font-mono">.env</code> file.</p>
              </div>
            </div>
          )}
          <div className="absolute bottom-3 right-4 text-[8px] sm:text-[10px] font-black text-primary/40 tracking-widest uppercase">
            Grok-2 AI Powered
          </div>
        </div>

        <Button
          onClick={generateRoutine}
          disabled={isLoading || !input.trim() || !import.meta.env.VITE_GROQ_API_KEY}
          variant="glow"
          className="w-full h-14 sm:h-16 mt-4 sm:mt-6 rounded-xl sm:rounded-[1.5rem] text-base sm:text-lg font-black uppercase tracking-tighter italic shadow-xl shadow-primary/20 group hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 transition-transform group-hover:rotate-12" />
              Generate My Day
            </>
          )}
        </Button>
      </div>

      {preview.length > 0 && (
        <div className="space-y-4 animate-slide-in">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold tracking-tight text-white/90">Preview Routine</h3>
            <div className="flex gap-2">
              <span className="text-[10px] font-black bg-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-widest">
                {preview.length} Tasks
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {preview.map((task, index) => (
              <div
                key={index}
                className="glass-premium p-5 rounded-3xl border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center font-black text-primary border border-border/50">
                    {task.time}
                  </div>
                  <div>
                    <p className="font-bold text-white/90">{task.task_name}</p>
                    <p className="text-xs text-muted-foreground/60 tracking-wide font-medium">Auto-Reminder: {task.remind_before}m before</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success opacity-0 group-hover:opacity-100 transition-opacity">
                  <Check className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleSave}
              variant="success"
              className="h-16 rounded-[1.5rem] text-sm font-black uppercase tracking-tighter italic shadow-xl shadow-success/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add More
            </Button>
            <Button
              onClick={handleReplaceAll}
              variant="glow"
              className="h-16 rounded-[1.5rem] text-sm font-black uppercase tracking-tighter italic shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-accent to-primary border-none"
            >
              <Check className="h-5 w-5 mr-2" />
              Replace All
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => setPreview([])}
            className="w-full h-12 rounded-2xl text-muted-foreground hover:text-white transition-colors uppercase tracking-widest text-[10px] font-black"
          >
            Clear and Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
