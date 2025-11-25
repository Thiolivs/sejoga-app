'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function RedirectContent() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = searchParams.toString();
        const appUrl = `app.sejoga://auth/callback?${params}`;
        const webUrl = `/auth/callback?${params}`;

        // Método 1: Tentar abrir via location
        window.location.href = appUrl;

        // Método 2: Criar iframe invisível (funciona melhor em alguns navegadores)
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = appUrl;
        document.body.appendChild(iframe);

        // Método 3: Detectar se app não abriu
        let appOpened = false;
        const start = Date.now();

        const checkInterval = setInterval(() => {
            if (Date.now() - start > 2500) {
                clearInterval(checkInterval);
                if (!appOpened && !document.hidden) {
                    // App não abriu, redireciona pro site
                    window.location.href = webUrl;
                }
            }
        }, 100);

        // Detecta se app foi aberto (página fica hidden)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                appOpened = true;
                clearInterval(checkInterval);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(checkInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
        };
    }, [searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-700 font-semibold">Abrindo o SeJoga App...</p>
                <p className="text-sm text-gray-500 mt-2">Aguarde enquanto tentamos abrir o aplicativo</p>
            </div>
        </div>
    );
}

export default function AuthRedirect() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        }>
            <RedirectContent />
        </Suspense>
    );
}