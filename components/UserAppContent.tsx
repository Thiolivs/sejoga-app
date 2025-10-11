'use client';

import { useState } from 'react';
import { BoardgameList } from '@/components/BoardgameList';

type Tab = 'jogos' | 'perfil' | 'estatisticas';

interface UserAppContentProps {
    userEmail: string;
}

export function UserAppContent({ userEmail }: UserAppContentProps) {
    const [activeTab, setActiveTab] = useState<Tab>('jogos');

    return (
        <>
            {/* Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('jogos')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'jogos'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Meus Jogos
                        </button>
                        <button
                            onClick={() => setActiveTab('perfil')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'perfil'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Perfil
                        </button>
                        <button
                            onClick={() => setActiveTab('estatisticas')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'estatisticas'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Estatísticas
                        </button>
                    </nav>
                </div>
            </div>

            {/* Conteúdo das abas */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'jogos' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">Meus Jogos</h2>
                            <p className="text-gray-600 mt-2">
                                Marque os jogos que você sabe ensinar para ajudar outros jogadores
                            </p>
                        </div>
                        <BoardgameList />
                    </div>
                )}

                {activeTab === 'perfil' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">Meu Perfil</h2>
                            <p className="text-gray-600 mt-2">Gerencie suas informações pessoais</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">{userEmail}</p>
                                </div>
                                {/* Adicione mais campos do perfil aqui */}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'estatisticas' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">Estatísticas</h2>
                            <p className="text-gray-600 mt-2">
                                Veja suas estatísticas e contribuições
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">
                                    Jogos que ensino
                                </h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
                                <p className="mt-1 text-sm text-gray-600">
                                    Total de jogos marcados
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">
                                    Jogos no evento
                                </h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
                                <p className="mt-1 text-sm text-gray-600">
                                    Total disponível
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">
                                    Contribuição
                                </h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">-%</p>
                                <p className="mt-1 text-sm text-gray-600">
                                    Dos jogos você ensina
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}