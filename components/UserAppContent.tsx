'use client';

import { useState } from 'react';
import { BoardgameList } from '@/components/BoardgameList';
import { useUserRole } from '@/hooks/useUserRole';
type Tab = 'jogos' | 'perfil' | 'estatisticas' | 'gerenciar';

interface UserAppContentProps {
    userEmail: string;
}

export function UserAppContent({ userEmail }: UserAppContentProps) {
    const [activeTab, setActiveTab] = useState<Tab>('jogos');
    const { isAdmin } = useUserRole();

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
                            Acervo
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

                        {/* NOVA ABA: Apenas para admins */}
                        {isAdmin && (
                            <button
                                onClick={() => setActiveTab('gerenciar')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'gerenciar'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Gerenciar
                            </button>
                        )}
                    </nav>
                </div>
            </div>


            {/* Conteúdo das abas */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-2">
                {activeTab === 'jogos' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-gray-600 text-center mb-8 text-2xl font-bold">
                                Todos os Jogos
                            </h2>
                            <p className="text-gray-600 mt-2">
                                <i>&quot;Prepara, menina, é sua vez de brilhar!&quot;</i>🌟
                            </p>
                            <p className="text-gray-600 mt-0 text-md">
                                <b>Marque aqui os jogos que você sabe ensinar 👨🏾‍🏫  </b>
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

                {/* NOVA ABA: Gerenciar (apenas admins) */}
                {activeTab === 'gerenciar' && isAdmin && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">Painel de Administração</h2>
                            <p className="text-gray-600 mt-2">
                                Gerencie jogos, usuários e permissões
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-bold mb-4">Gerenciar Jogos</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
                                            ➕ Adicionar novo jogo
                                        </button>
                                    </li>
                                    <li>
                                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
                                            📝 Editar jogos existentes
                                        </button>
                                    </li>
                                    <li>
                                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
                                            🗑️ Remover jogos
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-bold mb-4">Gerenciar Usuários</h3>
                                <ul className="space-y-2">
                                    <li>
                                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
                                            👥 Ver todos os usuários
                                        </button>
                                    </li>
                                    <li>
                                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
                                            🎓 Promover para monitor
                                        </button>
                                    </li>
                                    <li>
                                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">
                                            👑 Promover para admin
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}