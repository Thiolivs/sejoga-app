'use client';

import { UserAppHeader } from "@/components/UserAppHeader"
import { UserAppTabs } from "@/components/UserAppTabs"
import { useEffect, useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';

type Tab = 'training' | 'profile' | 'jogos' | 'register' | 'statistics';

export default function UserApp() {
    const [activeTab, setActiveTab] = useState<Tab>('jogos');
    const [debugInfo, setDebugInfo] = useState('');
    const { isAdmin, isMonitor } = useUserRole();

    useEffect(() => {
        const tabsEl = document.querySelectorAll('.flex-none')[1] as HTMLElement;
        const info = `
tabs offsetTop: ${tabsEl?.offsetTop}
tabs height: ${tabsEl?.clientHeight}
tabs offsetParent height: ${(tabsEl?.offsetParent as HTMLElement)?.clientHeight}
div.flex-col height: ${(document.querySelector('.flex.flex-col') as HTMLElement)?.clientHeight}
    `;
        setDebugInfo(info);
    }, []);

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
            {/* ✅ Debug visual */}
            {debugInfo && (
                <div className="fixed top-0 left-0 bg-red-500 text-white text-xs p-2 z-50 font-mono max-w-xs whitespace-pre">
                    {debugInfo}
                </div>
            )}

            <div className="flex-none">
                <UserAppHeader />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0" style={{ height: '0px' }}>
                <div style={{ background: 'blue', height: '100px' }}>TESTE</div>
            </div>

            <div className="flex-none">
                <UserAppTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    isMonitor={isMonitor}
                    isAdmin={isAdmin}
                />
            </div>
        </div>
    );
}