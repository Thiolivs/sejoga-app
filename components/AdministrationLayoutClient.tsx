'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';
import { useUserRole } from '@/hooks/useUserRole';
import { UserNav } from './common/user-nav';

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
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1 flex items-center relative">
                    <SidebarMenu isAdmin={isAdmin} isMonitor={isMonitor} currentPage="gerenciar" />
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    {/* ✅ Título centralizado absolutamente */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <h1 className="text-[35px] font-caveat text-gray-900 whitespace-nowrap">
                            SeJoga no App!
                        </h1>
                    </div>

                    <div className="ml-auto flex items-center">
                        <UserNav />
                    </div>
                </div>
            </header>



            {/* ✅ Conteúdo scrollável */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {children}
            </div>
        </div>
    );
}