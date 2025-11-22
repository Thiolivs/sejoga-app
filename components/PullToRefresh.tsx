'use client';

import { useEffect, useState } from 'react';

export function PullToRefresh() {
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        let startY = 0;
        let currentY = 0;
        let pulling = false;
        const threshold = 100;

        const handleTouchStart = (e: TouchEvent) => {
            // ✅ Verifica se REALMENTE está no topo (scroll = 0)
            const scrollableElement = document.querySelector('.overflow-y-auto') as HTMLElement;
            const isAtTop = scrollableElement ? scrollableElement.scrollTop === 0 : window.scrollY === 0;

            if (isAtTop) {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!pulling) return;

            currentY = e.touches[0].clientY;
            const distance = currentY - startY;

            // ✅ Só permite puxar para BAIXO (distância positiva)
            if (distance > 0 && distance < threshold * 2) {
                document.body.style.transform = `translateY(${Math.min(distance / 2.5, 60)}px)`;
                document.body.style.transition = 'none';
            }
        };

        const handleTouchEnd = async () => {
            if (!pulling) return;

            const distance = currentY - startY;

            // Reset visual
            document.body.style.transition = 'transform 0.3s ease';
            document.body.style.transform = 'translateY(0)';

            // ✅ Se passou do threshold, RECARREGA A PÁGINA
            if (distance > threshold) {
                setIsRefreshing(true);
                console.log('🔄 Recarregando página...');

                // ✅ Recarrega a página completamente
                setTimeout(() => {
                    window.location.reload();
                }, 300);
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
    }, []);

    return isRefreshing ? (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg">
            🔄 Atualizando...
        </div>
    ) : null;
}