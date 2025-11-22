'use client';

import { useRouter } from 'next/navigation';
import { ManageEvents } from '@/components/admin/ManageEvents';

export default function AddGamePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ManageEvents />
            </main>
        </div>
    );
}