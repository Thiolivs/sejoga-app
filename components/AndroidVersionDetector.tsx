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

                // ✅ Força 40px
                setTimeout(() => {
                    document.body.style.paddingTop = '40px';

                    let style = document.getElementById('android-statusbar-fix');
                    if (!style) {
                        style = document.createElement('style');
                        style.id = 'android-statusbar-fix';
                        document.head.appendChild(style);
                    }

                    style.innerHTML = `
            body::before {
                top: 40px !important;
            }
            `;

                    console.log('✅ 40px aplicado');
                }, 100);
            }
        }
    }, []);

    return null;
}