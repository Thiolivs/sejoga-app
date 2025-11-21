'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase'

export function BackgroundManager() {
    const [bgLoaded, setBgLoaded] = useState(false);
    const supabase = createClient()

    useEffect(() => {
        async function loadBackground() {
            const { data: { user } } = await supabase.auth.getUser();
            
            const bgImage = user 
                ? (await supabase.from('profiles').select('background').eq('id', user.id).single()).data?.background || '/images/backgrounds/rainbow.jpg'
                : '/images/backgrounds/rainbow.jpg';
            
            console.log('🎨 Aplicando background:', bgImage, user ? 'com usuário' : 'sem usuário');
            
            const style = document.createElement('style');
            style.id = 'dynamic-bg';
            style.innerHTML = `body::before { background-image: url(${bgImage}) !important; }`;
            
            const oldStyle = document.getElementById('dynamic-bg');
            if (oldStyle) oldStyle.remove();
            
            document.head.appendChild(style);
            console.log('✅ Style aplicado');
            setBgLoaded(true);
        }

        loadBackground();

        // ✅ ADICIONE: Escuta mudanças de autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔐 Auth mudou:', event);
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                loadBackground(); // Recarrega background quando logar
            }
        });

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
                            console.log('🔄 Background via realtime:', payload.new.background);
                            
                            const style = document.createElement('style');
                            style.id = 'dynamic-bg';
                            style.innerHTML = `body::before { background-image: url(${payload.new.background}) !important; }`;
                            
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

        return () => {
            authListener?.subscription.unsubscribe();
        };

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