'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';
import { useUserRole } from '@/hooks/useUserRole';
import { EventGameSelection } from '@/components/admin/EventGameSelection';

export default function EventSelectionPage() {
    const router = useRouter();
    const { isAdmin, isMonitor } = useUserRole();

    return (
        <div className="min-h-screen">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <SidebarMenu
                            isAdmin={isAdmin}
                            isMonitor={isMonitor}
                            currentPage="event-selection"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-bold">Relatórios</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Seu componente de eventos aqui */}
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                    <p className="text-yellow-800">
                                        🚧 Em desenvolvimento - Em breve uma nova página para você!
                                    </p>
                                </div>
            </main>
        </div>
    );
}                                
                                
                                
