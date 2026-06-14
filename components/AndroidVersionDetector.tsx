'use client';

import { useEffect } from 'react';

export function AndroidVersionDetector() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const ua = navigator.userAgent;
        const isNativeApp = ua.includes('SeJogaApp');
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        document.documentElement.setAttribute(
            'data-platform',
            `native:${isNativeApp}|pwa:${isStandalone}`
        );

        if (isNativeApp) {
            document.documentElement.classList.add('native-app');
        } else if (isStandalone) {
            document.documentElement.classList.add('pwa-standalone');
        }
    }, []);

    return null;
}