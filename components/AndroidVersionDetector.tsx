'use client';

import { useEffect } from 'react';

export function AndroidVersionDetector() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const userAgent = navigator.userAgent;
        const androidMatch = userAgent.match(/Android (\d+)/);

        if (androidMatch) {
            const androidVersion = parseInt(androidMatch[1]);

            if (androidVersion >= 15) {
                document.documentElement.classList.add('android-modern');
                document.body.style.paddingTop = '28px';

                // ✅ Ajusta a posição do background
                document.body.style.backgroundPosition = 'center 28px';
            }
        }
    }, []);

    return null;
}