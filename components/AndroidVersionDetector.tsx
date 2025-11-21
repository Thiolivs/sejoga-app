'use client';

import { useEffect } from 'react';

export function AndroidVersionDetector() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userAgent = navigator.userAgent;
            const androidMatch = userAgent.match(/Android (\d+)/);

            if (androidMatch) {
                const androidVersion = parseInt(androidMatch[1]);

                // Android 15+ (ou Android 16 beta) tem problema de status bar transparente
                if (androidVersion >= 15) {
                    document.documentElement.classList.add('android-modern');
                    console.log('Android moderno detectado:', androidVersion);
                } else {
                    console.log('Android antigo detectado:', androidVersion);
                }
            }
        }
    }, []);

    return null; // Componente invisível
}