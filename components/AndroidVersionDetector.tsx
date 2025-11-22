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

                setTimeout(() => {
                    document.body.style.paddingTop = '40px';

                    const observer = new MutationObserver(() => {
                        // ✅ Procura especificamente por dialogs com bg-background
                        const dialogs = document.querySelectorAll('[role="dialog"].bg-background');
                        dialogs.forEach((dialog) => {
                            if (dialog instanceof HTMLElement && !dialog.style.paddingTop) {
                                console.log('🔍 Sidebar encontrado, aplicando padding');
                                dialog.style.paddingTop = '40px';
                                dialog.style.setProperty('padding-top', '40px', 'important');
                            }
                        });
                    });

                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                    });

                    console.log('✅ Observer configurado');
                }, 100);
            }
        }
    }, []);

    return null;
}