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

                // Força padding no body
                document.body.style.paddingTop = '28px';

                // ✅ Move o background também
                const backgroundLayer = document.getElementById('background-layer');
                if (backgroundLayer) {
                    backgroundLayer.style.top = '28px';
                }
            }
        }
    }, []);

    return null;
}