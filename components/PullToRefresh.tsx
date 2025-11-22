'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function PullToRefresh() {
    const router = useRouter();

    useEffect(() => {
        let startY = 0;
        let currentY = 0;
        let pulling = false;
        const threshold = 80; // Pixels necessários para disparar refresh

        const handleTouchStart = (e: TouchEvent) => {
            // Só ativa se estiver no topo da página
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!pulling) return;

            currentY = e.touches[0].clientY;
            const distance = currentY - startY;

            // Se puxou para baixo o suficiente
            if (distance > threshold) {
                // Visual feedback (opcional)
                document.body.style.transform = `translateY(${Math.min(distance / 3, 50)}px)`;
            }
        };

        const handleTouchEnd = () => {
            if (!pulling) return;

            const distance = currentY - startY;

            // Reset visual
            document.body.style.transition = 'transform 0.3s ease';
            document.body.style.transform = 'translateY(0)';

            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);

            // Se passou do threshold, refresh
            if (distance > threshold) {
                console.log('🔄 Refresh disparado!');
                router.refresh();
            }

            pulling = false;
            startY = 0;
            currentY = 0;
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [router]);

    return null;
}