'use client';

import { SidebarMenu } from '@/components/SidebarMenu';
import { UserNav } from '@/components/common/user-nav';
import { useUserRole } from '@/hooks/useUserRole';
import { useState, useEffect } from 'react'; 

export function UserAppHeader() {
    const { isAdmin, isMonitor, loading } = useUserRole();
    const [mounted, setMounted] = useState(false); 

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="bg-white/90 shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        {mounted && (
                            <SidebarMenu
                                isAdmin={isAdmin}
                                isMonitor={isMonitor}
                                currentPage="user-app"
                            />
                        )}
                        <h1 className="text-2xl font-bold text-gray-900">SeJoga no App!</h1>
                    </div>
                    <UserNav />
                </div>
            </div>
        </header>
    );
}