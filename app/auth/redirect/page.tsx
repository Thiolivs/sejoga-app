'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function RedirectContent() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = searchParams.toString();

        // Tenta abrir o app
        window.location.href = `app.sejoga://auth/callback?${params}`;

        // Fallback: se não abrir em 2s, redireciona pro site
        setTimeout(() => {
            window.location.href = `/auth/callback?${params}`;
        }, 2000);
    }, [searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-700">Abrindo o app...</p>
                <p className="text-sm text-gray-500 mt-2">Se não abrir automaticamente, você será redirecionado.</p>
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