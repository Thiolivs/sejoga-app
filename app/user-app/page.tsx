'use client';

import { UserAppHeader } from "@/components/UserAppHeader"
import { UserAppTabs } from "@/components/UserAppTabs"
import { UserAppContent } from "@/components/UserAppContent"
import { useEffect, useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';

type Tab = 'training' | 'profile' | 'jogos' | 'register' | 'statistics';

export default function UserApp() {
    const [activeTab, setActiveTab] = useState<Tab>('jogos');
    const [debugInfo, setDebugInfo] = useState('');
    const { isAdmin, isMonitor } = useUserRole();

    useEffect(() => {
        setTimeout(() => {
            const flexContainer = document.querySelector('.flex.flex-col') as HTMLElement;
            const header = document.querySelector('.flex-none') as HTMLElement;
            const content = document.querySelector('.flex-1') as HTMLElement;
            const tabs = document.querySelectorAll('.flex-none')[1] as HTMLElement;

            const info = `
flex.flex-col height: ${flexContainer?.clientHeight}
header height: ${header?.clientHeight}
content height: ${content?.clientHeight}
tabs height: ${tabs?.clientHeight}
tabs offsetTop: ${tabs?.offsetTop}
total: ${(header?.clientHeight || 0) + (content?.clientHeight || 0) + (tabs?.clientHeight || 0)}
            `;
            setDebugInfo(info);
        }, 1000);
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
    <div className="flex flex-col h-screen overflow-hidden" style={{ overflow: 'hidden' }}>
        {debugInfo && (
            <div className="fixed top-0 left-0 bg-red-500 text-white text-xs p-2 z-50 font-mono max-w-xs whitespace-pre">
                {debugInfo}
            </div>
        )}

        <div className="flex-none">
            <UserAppHeader />
        </div>

        <div 
            className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
            style={{ maxHeight: '627px' }}
        >
            <UserAppContent activeTab={activeTab} />
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