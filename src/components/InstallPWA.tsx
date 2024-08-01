import { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { Button } from './ui/button';

export const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstallable(false);
        }
        setDeferredPrompt(null);
    };

    if (!isInstallable) return null;

    return (
        <div className="glass-premium p-4 rounded-2xl flex items-center justify-between gap-4 border-primary/20 animate-fade-in mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-semibold">Install Mobile App</p>
                    <p className="text-xs text-muted-foreground">Add to home screen for better experience</p>
                </div>
            </div>
            <Button
                variant="glow"
                size="sm"
                className="rounded-xl px-4"
                onClick={handleInstall}
            >
                <Download className="w-4 h-4 mr-2" />
                Install
            </Button>
        </div>
    );
};
