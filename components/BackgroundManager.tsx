'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function BackgroundManager() {
    const supabase = createClientComponentClient();

    useEffect(() => {
        async function loadBackground() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('profiles')
                .select('background')
                .eq('id', user.id)
                .single();

            if (data?.background) {
                document.body.style.backgroundImage = `url(${data.background})`;
            }
        }

        loadBackground();

        // Listener para mudanças
        const channel = supabase
            .channel('bg-changes')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${supabase.auth.getUser().then(r => r.data.user?.id)}`
            }, (payload: any) => {
                if (payload.new?.background) {
                    document.body.style.backgroundImage = `url(${payload.new.background})`;
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase]);

    return null;
}