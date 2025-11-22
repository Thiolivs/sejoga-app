'use client';

import { useEffect } from 'react';

export function AndroidVersionDetector() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const userAgent = navigator.userAgent;
        const androidMatch = userAgent.match(/Android (\d+)/);

        if (androidMatch) {
            const androidVersion = parseInt(androidMatch[1]);
            console.log('Android version:', androidVersion);

            if (androidVersion >= 15) {
                document.documentElement.classList.add('android-modern');
                console.log('✅ android-modern aplicado');
                
                // ✅ Força padding no body (para layout principal)
                setTimeout(() => {
                    document.body.style.paddingTop = '40px';
                }, 100);
            }
        }
    }, []);

    return null;
}