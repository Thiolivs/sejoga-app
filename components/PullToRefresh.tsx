'use client';

import { useEffect } from 'react';

export function PullToRefresh() {
    useEffect(() => {
        let startY = 0;
        let currentY = 0;
        let pulling = false;
        const threshold = 100;

        const handleTouchStart = (e: TouchEvent) => {
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

            if (distance > 0 && distance < threshold * 2) {
                document.body.style.transform = `translateY(${Math.min(distance / 2.5, 60)}px)`;
                document.body.style.transition = 'none';
            }
        };

        const handleTouchEnd = async () => {
            if (!pulling) return;

            const distance = currentY - startY;

            document.body.style.transition = 'transform 0.3s ease';
            document.body.style.transform = 'translateY(0)';

            if (distance > threshold) {
                console.log('🔄 Recarregando página...');
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

    return null;
}