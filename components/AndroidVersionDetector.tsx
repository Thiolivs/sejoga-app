'use client';

import { useEffect } from 'react';

export function AndroidVersionDetector() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const userAgent = navigator.userAgent;
        console.log('User Agent completo:', userAgent);

        // Tenta várias formas de detectar
        const androidMatch = userAgent.match(/Android (\d+)/);
        const isCapacitor = userAgent.includes('Capacitor');

        console.log('Android match:', androidMatch);
        console.log('É Capacitor?', isCapacitor);

        if (androidMatch) {
            const androidVersion = parseInt(androidMatch[1]);
            console.log('Versão Android detectada:', androidVersion);

            // Android 15+ OU se for Android 16 beta
            if (androidVersion >= 15) {
                document.documentElement.classList.add('android-modern');
                console.log('✅ Classe android-modern adicionada!');

                // Força padding diretamente também (backup)
                document.body.style.paddingTop = '28px';
                console.log('✅ Padding forçado no body!');
            }
        }

        // Log das classes finais
        setTimeout(() => {
            console.log('Classes no <html>:', document.documentElement.className);
            console.log('Padding no body:', document.body.style.paddingTop);
        }, 500);

    }, []);

    return null;
}