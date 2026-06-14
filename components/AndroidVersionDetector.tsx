'use client';

import { useEffect } from 'react';

export function AndroidVersionDetector() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        // DEBUG temporário
        document.documentElement.setAttribute('data-platform', `cap:${isCapacitor}|pwa:${isStandalone}|android-modern:${document.documentElement.classList.contains('android-modern')}`);
        if (!isCapacitor && !isStandalone) return;

        const androidMatch = navigator.userAgent.match(/Android (\d+)/);
        const androidVersion = androidMatch ? parseInt(androidMatch[1]) : 0;

        if (isCapacitor || androidVersion >= 15) {
            document.documentElement.classList.add('android-modern');
        }
    }, []);

    return null;
}