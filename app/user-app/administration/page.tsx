'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Settings, Tag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';
import { useUserRole } from '@/hooks/useUserRole';

export default function AdministrationPage() {
    const router = useRouter();
    const { isAdmin, isMonitor, loading } = useUserRole();

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
                    </div>
                </div>
            </header>

            {/* Conteúdo - Botões de navegação */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                    <h1 className="text-2xl text-center font-bold text-blue-800 flex-1">✨<i>Painel de Administração</i>✨</h1>

                <div className="bg-white rounded-lg shadow p-6 space-y-4">


                    <h2 className="text-xl text-center font-semibold text-gray-800 mb-6">
                        <i>Selecione uma opção:</i>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                       {/* Botão: Adicionar Jogo */}
                        
                        {/*
                        
                        <button
                            onClick={() => router.push('/user-app/administration/add-game')}
                            className="bg-sejoga-azul-oficial text-white rounded-lg shadow-lg p-3 transition-all hover:scale-105 text-center"
                        >
                            <h3 className="text-lg font-bold mb-1">➕ Adicionar Novo Jogo</h3>
                            <p className="text-blue-100 text-xs">Cadastrar um novo boardgame no sistema</p>
                        </button>

                        */}

                        {/* Botão: Gerenciar Jogos */}
                        <button
                            onClick={() => router.push('/user-app/administration/manage-games')}
                            className="bg-sejoga-vermelho-oficial text-white rounded-lg shadow-lg p-3 transition-all hover:scale-105 text-center"
                        >
                            <h3 className="text-lg font-bold mb-1">🎲 Gerenciar Jogos</h3>
                            <p className="text-green-100 text-xs">Editar, remover ou visualizar jogos existentes</p>
                        </button>

                        {/* Botão: Eventos */}
                        <button
                            onClick={() => router.push('/user-app/administration/manage-events')}
                            className="bg-sejoga-laranja-oficial text-white rounded-lg shadow-lg p-3 transition-all hover:scale-105 text-center"
                        >
                            <h3 className="text-lg font-bold mb-1">📅 Gerenciar Eventos</h3>
                            <p className="text-purple-100 text-xs">Criar e gerenciar eventos</p>
                        </button>

                        {/* Botão: Usuários */}
                        <button
                            onClick={() => router.push('/user-app/administration/manage-users')}
                            className="bg-sejoga-amarelo-oficial text-white rounded-lg shadow-lg p-3 transition-all hover:scale-105 text-center"
                        >
                                <h3 className="text-lg font-bold mb-1">👥 Gerenciar Usuários</h3>
                                <p className="text-purple-100 text-xs">Ver, promover ou gerenciar permissões</p>
                        </button>


                    {/* Botão: Gerenciar Ciclos*/}
                        <button
                            onClick={() => router.push('/user-app/administration/manage-cycles')}
                            className="bg-sejoga-verde-oficial text-white rounded-lg shadow-lg p-3 transition-all hover:scale-105 text-center"
                        >
                                <h3 className="text-lg font-bold mb-1">Gerenciar Treinamentos</h3>
                                <p className="text-purple-100 text-xs">Criar e gerenciar ciclos de treinamento</p>
                        </button>

                        
                    {/* Botão: Gerenciar Mecânicas*/}
                        <button
                            onClick={() => router.push('/user-app/administration/manage-mechanics')}
                            className="bg-sejoga-azul-oficial text-white rounded-lg shadow-lg p-3 transition-all hover:scale-105 text-center"
                        >
                                <h3 className="text-lg font-bold mb-1">Gerenciar Mecânicas</h3>
                                <p className="text-purple-100 text-xs">Criar e gerenciar mecânicas</p>
                        </button>

                        
                    {/* Botão: Gerenciar Editoras*/}
                        <button
                            onClick={() => router.push('/user-app/administration/manage-publishers')}
                            className="bg-sejoga-rosa-oficial text-white rounded-lg shadow-lg p-3 transition-all hover:scale-105 text-center"
                        >
                                <h3 className="text-lg font-bold mb-1">Gerenciar Editoras</h3>
                                <p className="text-purple-100 text-xs">Criar e gerenciar editoras</p>
                        </button>


                    </div>
                </div>
            </main>
        </div>
    );
}