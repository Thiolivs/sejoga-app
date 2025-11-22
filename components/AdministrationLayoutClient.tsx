'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';
import { useUserRole } from '@/hooks/useUserRole';

export function AdministrationLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAdmin, isMonitor } = useUserRole();

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* ✅ Header fixo */}
            <header className="flex-none bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                    <SidebarMenu isAdmin={isAdmin} isMonitor={isMonitor} currentPage="gerenciar" />
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-900 flex-1">Administração</h1>
                </div>
            </header>

            {/* ✅ Conteúdo scrollável */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {children}
            </div>
        </div>
    );
}