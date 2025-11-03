'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';
import { useUserRole } from '@/hooks/useUserRole';

export default function AdministrationPage() {
    const router = useRouter();
    const { isAdmin, isMonitor } = useUserRole();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                    <SidebarMenu isAdmin={isAdmin} isMonitor={isMonitor} currentPage="gerenciar" />
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Conteúdo */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-2xl font-bold text-center text-blue-800 mb-4">
                    <i>✨ Painel de Administração ✨</i>
                </h1>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg text-center font-semibold text-gray-700 mb-4 border-b pb-3">
                        Selecione uma opção:
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        {/* Jogos */}
                        <div
                            onClick={() => router.push('/user-app/administration/manage-games')}
                            className="cursor-pointer bg-sejoga-vermelho-oficial text-white rounded-lg shadow-md p-3 flex flex-col items-center justify-center text-center hover:shadow-lg hover:scale-105 transition-all"
                            style={{
                                textShadow:
                                    '1px 1px 2px rgba(0, 0, 0, 0.4)',
                            }}
                        >
                            <h3 className="text-lg font-bold mb-1">🎲 Gerenciar Jogos</h3>
                            <p className="text-xs text-green-100">Cadastrar, editar ou remover jogos</p>
                        </div>

                        {/* Eventos */}
                        <div
                            onClick={() => router.push('/user-app/administration/manage-events')}
                            className="cursor-pointer bg-sejoga-laranja-oficial text-white rounded-lg shadow-md p-3 flex flex-col items-center justify-center text-center hover:shadow-lg hover:scale-105 transition-all"
                            style={{
                                textShadow:
                                    '1px 1px 2px rgba(0, 0, 0, 0.4)',
                            }}
                        >
                            <h3 className="text-lg font-bold mb-1">📅 Gerenciar Eventos</h3>
                            <p className="text-xs text-purple-100">Criar e gerenciar eventos</p>
                        </div>

                        {/* Usuários */}
                        <div
                            onClick={() => router.push('/user-app/users')}
                            className="cursor-pointer bg-yellow-300 rounded-lg shadow-lg p-3 flex flex-col items-center justify-center text-center hover:shadow-lg hover:scale-105 transition-all"
                            style={{
                                textShadow:
                                    '1px 1px 2px rgba(0, 0, 0, 0.4)',
                            }}
                        >
                            <h3 className="text-lg font-bold text-white mb-1">👥 Gerenciar Usuários</h3>
                            <p className="text-xs text-white font-medium">Ver, promover e gerenciar permissões</p>
                        </div>

                        {/* Treinamentos */}
                        <div
                            onClick={() => router.push('/user-app/administration/manage-cycles')}
                            className="cursor-pointer bg-sejoga-verde-oficial text-white rounded-lg shadow-md p-3 flex flex-col items-center justify-center text-center hover:shadow-lg hover:scale-105 transition-all"
                            style={{
                                textShadow:
                                    '1px 1px 2px rgba(0, 0, 0, 0.4)',
                            }}
                        >
                            <h3 className="text-lg font-bold mb-1">📖 Gerenciar Treinamentos</h3>
                            <p className="text-xs text-purple-100">Criar e gerenciar ciclos</p>
                        </div>

                        {/* Mecânicas */}
                        <div
                            onClick={() => router.push('/user-app/administration/manage-mechanics')}
                            className="cursor-pointer bg-sejoga-azul-oficial text-white rounded-lg shadow-md p-3 flex flex-col items-center justify-center text-center hover:shadow-lg hover:scale-105 transition-all"
                            style={{
                                textShadow:
                                    '1px 1px 2px rgba(0, 0, 0, 0.4)',
                            }}
                        >
                            <h3 className="text-lg font-bold mb-1">⚙️ Gerenciar Mecânicas</h3>
                            <p className="text-xs text-purple-100">Criar e gerenciar mecânicas</p>
                        </div>

                        {/* Editoras */}
                        <div
                            onClick={() => router.push('/user-app/administration/manage-publishers')}
                            className="cursor-pointer bg-sejoga-rosa-oficial text-white rounded-lg shadow-md p-3 flex flex-col items-center justify-center text-center hover:shadow-lg hover:scale-105 transition-all"
                            style={{
                                textShadow:
                                    '1px 1px 2px rgba(0, 0, 0, 0.4)',
                            }}
                        >
                            <h3 className="text-lg font-bold mb-1">🏢 Gerenciar Editoras</h3>
                            <p className="text-xs text-purple-100">Criar e gerenciar editoras</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
