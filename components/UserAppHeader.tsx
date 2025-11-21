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
        <header className="sticky top-0 z-50 bg-white/90 shadow">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {mounted && (
                            <SidebarMenu
                                isAdmin={isAdmin}
                                isMonitor={isMonitor}
                                currentPage="user-app"
                            />
                        )}
                    </div>

                    <div className="flex-1 text-center">
                        <h1 className="text-[35px] font-caveat text-gray-900">
                            SeJoga no App!
                        </h1>
                    </div>

                    <div className="flex items-center justify-end">
                        <UserNav />
                    </div>
                </div>
            </div>
        </header>
    );
}