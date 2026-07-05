'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export function DeepLinkHandler() {
    const router = useRouter();

    useEffect(() => {
        let listenerHandle: { remove: () => void } | undefined;

        const setup = async () => {
            // Importa o plugin só no cliente (evita erro no build/SSR)
            let App;
            try {
                App = (await import('@capacitor/app')).App;
            } catch {
                // Plugin não disponível (ex: rodando na web pura) — ignora
                return;
            }

            listenerHandle = await App.addListener('appUrlOpen', async (event: { url: string }) => {
                try {
                    const url = new URL(event.url);

                    // Aceita tanto app.sejoga://auth/callback quanto https://sejoga.app/auth/callback
                    const isAuthCallback =
                        url.pathname.includes('/auth/callback') ||
                        url.host.includes('auth');

                    if (!isAuthCallback) return;

                    const token_hash = url.searchParams.get('token_hash');
                    const type = url.searchParams.get('type');
                    const code = url.searchParams.get('code');

                    const supabase = createClient();

                    if (code) {
                        await supabase.auth.exchangeCodeForSession(code);
                    } else if (token_hash && type) {
                        await supabase.auth.verifyOtp({
                            token_hash,
                            type: type as 'signup' | 'email' | 'recovery' | 'invite' | 'magiclink',
                        });
                    } else {
                        return;
                    }

                    // Sessão criada — entra no app
                    router.push('/user-app');
                    router.refresh();
                } catch (err) {
                    console.error('Erro ao processar deep link:', err);
                }
            });
        };

        setup();

        return () => {
            listenerHandle?.remove();
        };
    }, [router]);

    return null;
}