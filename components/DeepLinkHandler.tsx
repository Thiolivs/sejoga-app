'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export function DeepLinkHandler() {
    const router = useRouter();
    const [debug, setDebug] = useState<string>('');

    useEffect(() => {
        let listenerHandle: { remove: () => void } | undefined;

        const setup = async () => {
            let App;
            try {
                App = (await import('@capacitor/app')).App;
            } catch {
                setDebug('plugin @capacitor/app NAO carregou (web?)');
                return;
            }

            setDebug('listener registrado, aguardando link...');

            listenerHandle = await App.addListener('appUrlOpen', async (event: { url: string }) => {
                setDebug(`URL recebida: ${event.url}`);

                try {
                    const url = new URL(event.url);

                    const token_hash = url.searchParams.get('token_hash');
                    const type = url.searchParams.get('type');
                    const code = url.searchParams.get('code');

                    setDebug(
                        `host: ${url.host}\npath: ${url.pathname}\nsearch: ${url.search}\nhash: ${url.hash}\ntoken_hash: ${token_hash}\ntype: ${type}\ncode: ${code}`
                    );

                    const supabase = createClient();

                    if (code) {
                        const { error } = await supabase.auth.exchangeCodeForSession(code);
                        setDebug(`exchangeCode -> ${error ? 'ERRO: ' + error.message : 'OK'}`);
                    } else if (token_hash && type) {
                        const { error } = await supabase.auth.verifyOtp({
                            token_hash,
                            type: type as 'signup' | 'email' | 'recovery' | 'invite' | 'magiclink',
                        });
                        setDebug(`verifyOtp -> ${error ? 'ERRO: ' + error.message : 'OK'}`);
                        if (error) return;
                    } else {
                        setDebug(`SEM token_hash/type/code na URL: ${event.url}`);
                        return;
                    }

                    router.push('/user-app');
                    router.refresh();
                } catch (err) {
                    setDebug(`EXCECAO: ${err instanceof Error ? err.message : String(err)}\nURL: ${event.url}`);
                }
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