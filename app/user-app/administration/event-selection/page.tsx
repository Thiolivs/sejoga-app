'use client';

import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { EventGameSelection } from '@/components/admin/EventGameSelection';

export default function EventSelectionPage() {
    const router = useRouter();
    const { isAdmin, isMonitor } = useUserRole();

    return (
        <div className="min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Seu componente de eventos aqui */}
                <EventGameSelection />
            </main>
        </div>
    );
}