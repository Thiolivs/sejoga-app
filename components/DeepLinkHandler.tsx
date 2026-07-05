'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export function DeepLinkHandler() {
    const router = useRouter();
    const [debug, setDebug] = useState<string>('');

    useEffect(() => {
        let listenerHandle: { remove: () => void } | undefined;

        // Processa uma URL de deep link (extrai token e cria sessão)
        const processUrl = async (rawUrl: string) => {
            setDebug(`URL: ${rawUrl}`);
            try {
                const url = new URL(rawUrl);

                const token_hash = url.searchParams.get('token_hash');
                const type = url.searchParams.get('type');
                const code = url.searchParams.get('code');

                if (!token_hash && !code) {
                    setDebug(`sem token/code na URL: ${rawUrl}`);
                    return;
                }

                const supabase = createClient();

                if (code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) { setDebug(`exchangeCode ERRO: ${error.message}`); return; }
                } else if (token_hash && type) {
                    const { error } = await supabase.auth.verifyOtp({
                        token_hash,
                        type: type as 'signup' | 'email' | 'recovery' | 'invite' | 'magiclink',
                    });
                    if (error) { setDebug(`verifyOtp ERRO: ${error.message}`); return; }
                } else {
                    return;
                }

                setDebug('sessao criada, redirecionando...');
                router.push('/user-app');
                router.refresh();
            } catch (err) {
                setDebug(`EXCECAO: ${err instanceof Error ? err.message : String(err)}`);
            }
        };

        const setup = async () => {
            let App;
            try {
                App = (await import('@capacitor/app')).App;
            } catch {
                return;
            }

            // 1. App aberto a partir do link (app estava fechado): getLaunchUrl
            try {
                const launch = await App.getLaunchUrl();
                if (launch?.url) {
                    await processUrl(launch.url);
                }
            } catch {
                // sem launch url, segue normal
            }

            // 2. Link clicado com o app já aberto: appUrlOpen
            listenerHandle = await App.addListener('appUrlOpen', async (event: { url: string }) => {
                await processUrl(event.url);
            });
        };

        setup();

        return () => {
            listenerHandle?.remove();
        };
    }, [router]);

    if (!debug) return null;

    return (
        <div className="fixed bottom-2 left-2 right-2 bg-black text-white text-[10px] p-2 rounded z-[9999] font-mono whitespace-pre-wrap max-h-48 overflow-auto">
            {debug}
        </div>
    );
}