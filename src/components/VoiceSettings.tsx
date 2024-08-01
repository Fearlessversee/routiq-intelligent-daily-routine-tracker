import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Loader2, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { useVoice } from '@/hooks/useVoice';

interface VoiceSettingsProps {
    onClose?: () => void;
}

export const VoiceSettings = ({ onClose }: VoiceSettingsProps) => {
    const [isTesting, setIsTesting] = useState(false);
    const { speak, isLoading } = useVoice();

    const handleTestVoice = async () => {
        setIsTesting(true);
        try {
            speak('Namaste! Ab hum browser ki stable voice use kar rahe hain. Voice quality check kijiye bhai.');
            toast.success('Browser voice working!');
        } catch (err) {
            toast.error('Test failed.');
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="space-y-6 p-2">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gradient">Voice Settings</h2>
                <p className="text-muted-foreground text-sm">
                    Browser Web Speech API Active (Stable Mode)
                </p>
            </div>

            <div className="space-y-4">
                <Button
                    onClick={handleTestVoice}
                    disabled={isTesting || isLoading}
                    variant="glow"
                    className="w-full h-14 rounded-2xl text-base font-semibold"
                >
                    {isTesting || isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Speaking...
                        </>
                    ) : (
                        <>
                            <Volume2 className="h-5 w-5 mr-2" />
                            Test Browser Voice
                        </>
                    )}
                </Button>
            </div>

            <div className="glass-premium p-4 rounded-2xl border-primary/20 space-y-3">
                <div className="flex items-start gap-3">
                    <Settings2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-semibold text-primary">High Stability</p>
                        <p className="text-sm text-muted-foreground">
                            Yeh aawaz bina kisi server ke direct browser se chalti hai. Yeh RTX 50 series ke saath ekdam stable hai.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
                <p className="font-semibold text-sm">Voice Configuration:</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Engine: Web Speech API</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Mode: Zero Server (Fully Offline)</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Priority: Stability & Speed</span>
                    </li>
                </ul>
            </div>

            {onClose && (
                <Button variant="ghost" onClick={onClose} className="w-full h-12 rounded-xl">
                    Close
                </Button>
            )}
        </div>
    );
};
