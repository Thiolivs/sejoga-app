'use client';

import { ManagePublishers } from '@/components/admin/ManagePublishers';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';


export default function ManagePublishersPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ManagePublishers />
            </main>
        </div>
    );
}