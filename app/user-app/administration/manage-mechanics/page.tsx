'use client';

import { ManageMechanics } from '@/components/admin/ManageMechanics';
import { useRouter } from 'next/navigation';

export default function ManageMechanicsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ManageMechanics />
            </main>
        </div>
    );
}