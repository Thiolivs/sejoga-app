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

                // ✅ Força padding via JS
                setTimeout(() => {
                    document.body.style.paddingTop = '40px';

                    // ✅ ADICIONE: Observer para sidebars/dialogs
                    const observer = new MutationObserver(() => {
                        // Procura por sidebars/dialogs abertos
                        const dialogs = document.querySelectorAll('[role="dialog"], [data-radix-dialog-content]');
                        dialogs.forEach((dialog) => {
                            if (dialog instanceof HTMLElement) {
                                dialog.style.paddingTop = '40px';
                            }
                        });
                    });

                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                    });

                    console.log('✅ Padding e observer configurados');
                }, 100);
            }
        }
    }, []);

    return null;
}