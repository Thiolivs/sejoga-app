'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase'

export function BackgroundManager() {
    const [bgLoaded, setBgLoaded] = useState(false);
    const supabase = createClient()

    useEffect(() => {
        async function loadBackground() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // ✅ Define background padrão
                const style = document.createElement('style');
                style.innerHTML = `body::before { background-image: url(/images/backgrounds/rainbow.jpg); }`;
                document.head.appendChild(style);
                setBgLoaded(true);
                return;
            }

            const { data } = await supabase
                .from('profiles')
                .select('background')
                .eq('id', user.id)
                .single();

            const bgImage = data?.background || '/images/backgrounds/rainbow.jpg';
            
            // ✅ Aplica no pseudo-elemento via style tag
            const style = document.createElement('style');
            style.id = 'dynamic-bg';
            style.innerHTML = `body::before { background-image: url(${bgImage}); }`;
            
            // Remove style anterior se existir
            const oldStyle = document.getElementById('dynamic-bg');
            if (oldStyle) oldStyle.remove();
            
            document.head.appendChild(style);
            setBgLoaded(true);
        }

        loadBackground();

        const setupRealtimeListener = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();

            if (!currentUser) return;

            const channel = supabase
                .channel(`profile-changes-${currentUser.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${currentUser.id}`
                    },
                    (payload: { new?: { background?: string } }) => {
                        if (payload.new?.background) {
                            const style = document.createElement('style');
                            style.id = 'dynamic-bg';
                            style.innerHTML = `body::before { background-image: url(${payload.new.background}); }`;
                            
                            const oldStyle = document.getElementById('dynamic-bg');
                            if (oldStyle) oldStyle.remove();
                            
                            document.head.appendChild(style);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupRealtimeListener();

    }, [supabase]);

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