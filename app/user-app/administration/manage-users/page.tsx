'use client';

import { ManageUsers } from '@/components/admin/ManageUsers';
import { useRouter } from 'next/navigation';


export default function ManageUsersPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ManageUsers />
            </main>
        </div>
    );
}