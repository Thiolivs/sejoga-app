'use client';

import { ManageMechanics } from '@/components/admin/ManageMechanics';
import { ManagePublishers } from '@/components/admin/ManagePublishers';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ManageMechanicsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ManageMechanics />
            </main>
        </div>
    );
}