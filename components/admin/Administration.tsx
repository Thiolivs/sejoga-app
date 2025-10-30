'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Settings, Tag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';
import { useUserRole } from '@/hooks/useUserRole';

// Importe seus componentes de administração
import { AddGameForm } from '@/components/admin/AddGameForm';
import { EditGameForm } from '@/components/admin/EditGameForm';
import { EventManagement } from '@/components/admin/EventManagement';
import { AdminGamesList } from './AdminGamesList';
// import { ManageUsers } from '@/components/admin/ManageUsers';

type AdminTab = 'add-game' | 'manage-games' | 'manage-events' | 'manage-users';

export default function AdministrationPage() {
    const router = useRouter();
    const { isAdmin, isMonitor } = useUserRole();
    const [activeTab, setActiveTab] = useState<AdminTab>('add-game');

    // Redireciona se não for admin
    if (!isAdmin) {
        router.push('/user-app');
        return null;
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <SidebarMenu
                            isAdmin={isAdmin}
                            isMonitor={isMonitor}
                            currentPage="gerenciar"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-bold text-red-600">Administração</h1>
                    </div>
                </div>
            </header>

            {/* Sub-navegação (Tabs de administração) */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-2 overflow-x-auto" aria-label="Admin Tabs">
                        {/* Tab: Adicionar Jogo */}
                        <button
                            onClick={() => setActiveTab('add-game')}
                            className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors flex flex-col items-center gap-1 whitespace-nowrap ${
                                activeTab === 'add-game'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Plus className="w-5 h-5" />
                            <span>Adicionar Jogo</span>
                        </button>

                        {/* Tab: Gerenciar Jogos */}
                        <button
                            onClick={() => setActiveTab('manage-games')}
                            className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors flex flex-col items-center gap-1 whitespace-nowrap ${
                                activeTab === 'manage-games'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Settings className="w-5 h-5" />
                            <span>Gerenciar Jogos</span>
                        </button>

                        {/* Tab: Events */}
                        <button
                            onClick={() => setActiveTab('manage-events')}
                            className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors flex flex-col items-center gap-1 whitespace-nowrap ${
                                activeTab === 'manage-events'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Tag className="w-5 h-5" />
                            <span>Mecânicas</span>
                        </button>

                        {/* Tab: Usuários */}
                        <button
                            onClick={() => setActiveTab('manage-users')}
                            className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors flex flex-col items-center gap-1 whitespace-nowrap ${
                                activeTab === 'manage-users'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            <span>Usuários</span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Conteúdo das tabs */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'add-game' && <AddGameForm />}
                {activeTab === 'manage-games' && <AdminGamesList />}
                {activeTab === 'manage-events' && <EventManagement />}
                {/*{activeTab === 'manage-users' && <ManageUsers />}*/}
            </main>
        </div>
    );
}