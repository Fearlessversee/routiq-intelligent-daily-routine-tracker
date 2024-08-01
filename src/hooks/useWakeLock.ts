import { useState, useCallback, useEffect } from 'react';

export const useWakeLock = () => {
    const [isActive, setIsActive] = useState(false);
    const sentinelRef = (window as any).navigator?.wakeLock ? { current: null } : null;

    const requestWakeLock = useCallback(async () => {
        if (!('wakeLock' in navigator)) return;

        try {
            const sentinel = await (navigator as any).wakeLock.request('screen');
            sentinel.addEventListener('release', () => {
                setIsActive(false);
            });
            (sentinelRef as any).current = sentinel;
            setIsActive(true);
            console.log('Wake Lock active');
        } catch (err) {
            console.error('Wake Lock request failed:', err);
        }
    }, []);

    const releaseWakeLock = useCallback(() => {
        if ((sentinelRef as any)?.current) {
            (sentinelRef as any).current.release();
            (sentinelRef as any).current = null;
        }
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (isActive && document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isActive, requestWakeLock]);

    return { isActive, requestWakeLock, releaseWakeLock };
};
