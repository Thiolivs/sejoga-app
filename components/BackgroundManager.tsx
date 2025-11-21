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
                setBgLoaded(true);
                return;
            }

            const { data } = await supabase
                .from('profiles')
                .select('background')
                .eq('id', user.id)
                .single();

            if (data?.background) {
                // ✅ MUDOU: Atualiza background-layer em vez de body
                const backgroundLayer = document.getElementById('background-layer');
                if (backgroundLayer) {
                    backgroundLayer.style.backgroundImage = `url(${data.background})`;
                } else {
                    // Fallback
                    document.body.style.backgroundImage = `url(${data.background})`;
                }
            }
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
                            // ✅ MUDOU: Atualiza background-layer em vez de body
                            const backgroundLayer = document.getElementById('background-layer');
                            if (backgroundLayer) {
                                backgroundLayer.style.backgroundImage = `url(${payload.new.background})`;
                            } else {
                                // Fallback
                                document.body.style.backgroundImage = `url(${payload.new.background})`;
                            }
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