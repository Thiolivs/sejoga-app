'use client';

import { useState, ReactNode } from 'react';
import { SplashScreen } from '@/components/SplashScreen';

interface HomeWithSplashProps {
    children: ReactNode;
}

export function HomeWithSplash({ children }: HomeWithSplashProps) {
    const [showSplash, setShowSplash] = useState(true);

    return (
        <>
            {showSplash && (
                <SplashScreen
                    onFinish={() => setShowSplash(false)}
                    logoUrl="/sejoga-id/MeepleColorido.png"
                />
            )}
            
            {!showSplash && children}
        </>
    );
}