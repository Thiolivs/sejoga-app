'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';
import { useUserRole } from '@/hooks/useUserRole';

export default function AdministrationPage() {
    const router = useRouter();
    const { isAdmin, isMonitor } = useUserRole();

    const buttonBaseStyle =
        'relative cursor-pointer rounded-lg shadow-md p-3 flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all overflow-hidden';

    const textShadowStyle = {
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.4)',
    };

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
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                <h1 className="text-2xl font-bold text-center text-blue-800 mb-4">
                    ✨ <i>Painel de Administração </i>✨
                </h1>

                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg text-center font-semibold text-gray-700 mb-4 border-b pb-3">
                        Selecione uma opção:
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                        {/* Jogos */}
                        <div
                            onClick={() => router.push('/user-app/administration/manage-games')}
                            className={`${buttonBaseStyle} bg-sejoga-vermelho-oficial text-white`}
                            style={textShadowStyle}
                        >
                            <div className="flex items-center justify-center w-1/5 h-full">
                                <span className="text-3xl">🎲</span>
                            </div>
                            <div className="h-12 w-[1px] bg-gray-300 opacity-60" />
                            <div className="flex flex-col items-center justify-center w-4/5 text-center">
                                <h3 className="text-lg font-bold mb-1">Gerenciar Jogos</h3>
                                <p className="text-xs text-white">Cadastrar, editar ou remover jogos</p>
                            </div>
                        </div>

                        {/* Eventos */}
                        <div
                            onClick={() => router.push('/user-app/administration/manage-events')}
                            className={`${buttonBaseStyle} bg-sejoga-laranja-oficial text-white`}
                            style={textShadowStyle}
                        >
                            <div className="flex items-center justify-center w-1/5 h-full">
                                <span className="text-3xl">🎉</span>
                            </div>
                            <div className="h-12 w-[1px] bg-gray-300 opacity-60" />
                            <div className="flex flex-col items-center justify-center w-4/5 text-center">
                                <h3 className="text-lg font-bold mb-1">Gerenciar Eventos</h3>
                                <p className="text-xs text-white">Criar e gerenciar eventos</p>
                            </div>
                        </div>

                        {/* Usuários */}
                        <div
                            onClick={() => router.push('/user-app/users')}
                            className={`${buttonBaseStyle} bg-yellow-300 text-white`}
                            style={textShadowStyle}
                        >
                            <div className="flex items-center justify-center w-1/5 h-full">
                                <span className="text-3xl">👩🏽‍💻</span>
                            </div>
                            <div className="h-12 w-[1px] bg-gray-300 opacity-60" />
                            <div className="flex flex-col items-center justify-center w-4/5 text-center">
                                <h3 className="text-lg font-bold mb-1">Gerenciar Usuários</h3>
                                <p className="text-xs font-medium">Ver, promover e gerenciar permissões</p>
                            </div>
                        </div>

                        {/* Treinamentos */}
                        <div
                            onClick={() => router.push('/user-app/administration/manage-cycles')}
                            className={`${buttonBaseStyle} bg-sejoga-verde-oficial text-white`}
                            style={textShadowStyle}
                        >
                            <div className="flex items-center justify-center w-1/5 h-full">
                                <span className="text-3xl">📙</span>
                            </div>
                            <div className="h-12 w-[1px] bg-gray-300 opacity-60" />
                            <div className="flex flex-col items-center justify-center w-4/5 text-center">
                                <h3 className="text-lg font-bold mb-1">Gerenciar Treinamentos</h3>
                                <p className="text-xs text-green-100">Criar e gerenciar ciclos</p>
                            </div>
                        </div>

                        {/* Mecânicas */}
                        <div
                            onClick={() => router.push('/user-app/administration/manage-mechanics')}
                            className={`${buttonBaseStyle} bg-sejoga-azul-oficial text-white`}
                            style={textShadowStyle}
                        >
                            <div className="flex items-center justify-center w-1/5 h-full">
                                <span className="text-3xl">⚙️</span>
                            </div>
                            <div className="h-12 w-[1px] bg-gray-300 opacity-60" />
                            <div className="flex flex-col items-center justify-center w-4/5 text-center">
                                <h3 className="text-lg font-bold mb-1">Gerenciar Mecânicas</h3>
                                <p className="text-xs text-blue-100">Criar e gerenciar mecânicas</p>
                            </div>
                        </div>

                        {/* Editoras */}
                        <div
                            onClick={() => router.push('/user-app/administration/manage-publishers')}
                            className={`${buttonBaseStyle} bg-sejoga-rosa-oficial text-white`}
                            style={textShadowStyle}
                        >
                            <div className="flex items-center justify-center w-1/5 h-full">
                                <span className="text-3xl">🏢</span>
                            </div>
                            <div className="h-12 w-[1px] bg-gray-300 opacity-60" />
                            <div className="flex flex-col items-center justify-center w-4/5 text-center">
                                <h3 className="text-lg font-bold mb-1">Gerenciar Editoras</h3>
                                <p className="text-xs text-purple-100">Criar e gerenciar editoras</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
