'use client';

import { UserAppHeader } from "@/components/UserAppHeader"
import { UserAppTabs } from "@/components/UserAppTabs"
import { UserAppContent } from "@/components/UserAppContent"
import { useEffect, useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import dynamic from 'next/dynamic';

type Tab = 'training' | 'profile' | 'jogos' | 'register' | 'statistics';

function UserAppComponent() {
    const [activeTab, setActiveTab] = useState<Tab>('jogos');
    const { isAdmin, isMonitor } = useUserRole();

    useEffect(() => {
        const isActiveSession = sessionStorage.getItem('sejoga-session-active');

        if (isActiveSession === 'true') {
            const savedTab = localStorage.getItem('userapp-active-tab');
            if (savedTab && ['training', 'profile', 'jogos', 'register', 'statistics'].includes(savedTab)) {
                setActiveTab(savedTab as Tab);
            }
        } else {
            sessionStorage.setItem('sejoga-session-active', 'true');
        }
    }, []);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        localStorage.setItem('userapp-active-tab', tab);
    };

    useEffect(() => {
        return () => {
            localStorage.removeItem('userapp-active-tab');
            sessionStorage.removeItem('sejoga-session-active');
        };
    }, []);

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-none">
                <UserAppHeader />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0" style={{
                paddingBottom: '70px' // altura aproximada das tabs + safe-area
            }}>
                <UserAppContent activeTab={activeTab} />
            </div>

            <div className="flex-none fixed bottom-0 left-0 right-0 z-50" style={{
                paddingBottom: 'env(safe-area-inset-bottom)'
            }}>                <UserAppTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    isMonitor={isMonitor}
                    isAdmin={isAdmin}
                />
            </div>
        </div>
    );
}

// ✅ Desativa SSR
const UserApp = dynamic(() => Promise.resolve(UserAppComponent), {
    ssr: false
});

export default UserApp;