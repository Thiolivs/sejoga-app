'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export function DeepLinkHandler() {
    const router = useRouter();
    const [debug, setDebug] = useState<string>('iniciando...');

    useEffect(() => {
        let listenerHandle: { remove: () => void } | undefined;

        const processUrl = async (rawUrl: string, origem: string) => {
            setDebug(`[${origem}] URL: ${rawUrl}`);
            try {
                const url = new URL(rawUrl);
                const token_hash = url.searchParams.get('token_hash');
                const type = url.searchParams.get('type');
                const code = url.searchParams.get('code');

                if (!token_hash && !code) {
                    setDebug(`[${origem}] sem token/code\nsearch: ${url.search}\nhash: ${url.hash}`);
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
                setDebug('plugin NAO carregou (web pura)');
                return;
            }

            let msg = 'plugin OK. ';

            try {
                const launch = await App.getLaunchUrl();
                msg += `launchUrl: ${launch?.url ?? 'vazio'}`;
                setDebug(msg);
                if (launch?.url) {
                    await processUrl(launch.url, 'launch');
                    return;
                }
            } catch (e) {
                msg += `launchUrl erro: ${e instanceof Error ? e.message : String(e)}`;
                setDebug(msg);
            }

            listenerHandle = await App.addListener('appUrlOpen', async (event: { url: string }) => {
                await processUrl(event.url, 'appUrlOpen');
            });
        };

        setup();

        return () => {
            listenerHandle?.remove();
        };
    }, [router]);

    return (
        <div className="fixed bottom-2 left-2 right-2 bg-black text-white text-[10px] p-2 rounded z-[9999] font-mono whitespace-pre-wrap max-h-48 overflow-auto">
            DEBUG: {debug}
        </div>
    );
}