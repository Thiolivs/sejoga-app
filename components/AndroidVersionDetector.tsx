'use client';

import { useEffect } from 'react';

export function AndroidVersionDetector() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const detect = () => {
            const cap = (window as any).Capacitor;
            const isCapacitor =
                !!cap?.isNativePlatform?.() ||
                cap?.getPlatform?.() === 'android' ||
                cap?.platform === 'android' ||
                !!cap?.isNative;

            const isStandalone =
                window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true;

            document.documentElement.setAttribute(
                'data-platform',
                `cap:${isCapacitor}|pwa:${isStandalone}|hasCap:${!!cap}`
            );

            if (isCapacitor || isStandalone) {
                const androidMatch = navigator.userAgent.match(/Android (\d+)/);
                const androidVersion = androidMatch ? parseInt(androidMatch[1]) : 0;
                if (isCapacitor || androidVersion >= 15) {
                    document.documentElement.classList.add('android-modern');
                    return true;
                }
            }
            return false;
        };

        // Tenta imediatamente; se o bridge ainda não chegou, tenta de novo brevemente.
        if (!detect()) {
            const id = setInterval(() => {
                if (detect()) clearInterval(id);
            }, 100);
            setTimeout(() => clearInterval(id), 2000);
        }
    }, []);

    return null;
}