'use client';

import { UserAppHeader } from "@/components/UserAppHeader"
import { UserAppTabs } from "@/components/UserAppTabs"
import { UserAppContent } from "@/components/UserAppContent"
import { useEffect, useState } from 'react';

type Tab = 'training' | 'profile' | 'jogos' | 'register' | 'statistics';

export default function UserApp() {
    const [activeTab, setActiveTab] = useState<Tab>('jogos');

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
            {/* ✅ Header + Tabs fixos fora do scroll */}
            <div className="flex-none">
                <UserAppHeader />
                <UserAppTabs activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
            
            {/* ✅ Conteúdo com scroll - começa ABAIXO das tabs */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <UserAppContent activeTab={activeTab} />
            </div>
        </div>
    );
}