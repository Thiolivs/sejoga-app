'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function BackgroundManager() {
    const [bgLoaded, setBgLoaded] = useState(false);
    const supabase = createClientComponentClient();

    useEffect(() => {
        async function loadBackground() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setBgLoaded(true);
                return;
            }

            const { data } = await supabase
                .from('profiles')
                .select('background')
                .eq('id', user.id)
                .single();

            if (data?.background) {
                document.body.style.backgroundImage = `url(${data.background})`;
            }
            setBgLoaded(true);
        }

        loadBackground();

        const channel = supabase
            .channel('bg-changes')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
            }, (payload: { new?: { background?: string } }) => {
                if (payload.new?.background) {
                    document.body.style.backgroundImage = `url(${payload.new.background})`;
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase]);

    // Overlay durante carregamento
    if (!bgLoaded) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'white',
                zIndex: 9999
            }} />
        );
    }

    return null;
}