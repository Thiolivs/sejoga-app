'use client';

import { EventManagement } from '@/components/admin/EventManagement';
import { TeachingSessionLog } from '@/components/TeachingSessionLog';
import { User, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { EventGameSelection } from '@/components/admin/EventGameSelection';
import { AddGameForm } from '@/components/admin/AddGameForm';
import { AdminGamesList } from '@/components/admin/AdminGamesList';
import { useState, useEffect } from 'react';
import { BoardgameList } from '@/components/BoardgameList';
import { useUserRole } from '@/hooks/useUserRole';
import { SidebarMenu } from '@/components/SidebarMenu';


import { CircleUser, ClipboardList, Calendar, BarChart, Dices } from "lucide-react"


type Tab = 'jogos' | 'profile' | 'register' | 'gerenciar' | 'evento';
type AdminSection = 'menu' | 'add-game' | 'manage-games' | 'manage-events' | 'manage-users';

interface UserAppContentProps {
    userEmail: string;
}

export function UserAppContent({ userEmail }: UserAppContentProps) {
    const [activeTab, setActiveTab] = useState<Tab>('jogos');
    const [adminSection, setAdminSection] = useState<AdminSection>('menu');
    const { isAdmin } = useUserRole();
    const { isMonitor } = useUserRole();
    const supabase = createClientComponentClient();
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [teachCount, setTeachCount] = useState(0);
    const [totalGames, setTotalGames] = useState(0);

    // Busca o usuário autenticado e o nome no perfil
    useEffect(() => {
        const fetchUserAndProfile = async () => {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                console.log("Erro ao buscar usuário:", userError);
                return;
            }

            setUser(user);

            // Busca o nome do perfil na tabela "profiles"
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("first_name, role")
                .eq("id", user.id)
                .single();

            if (profileError) {
                console.log("Erro ao buscar perfil:", profileError);
            } else if (profile) {
                setName(profile.first_name);
                setRole(profile.role);

                // Conta quantos jogos o usuário sabe ensinar
                const { count: teachCount, error: teachesError } = await supabase
                    .from("user_teaches_game")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", user.id);

                if (teachesError) {
                    console.log("Erro ao contar jogos ensinados:", teachesError);
                } else {
                    setTeachCount(teachCount ?? 0);
                }

                // Conta quantos jogos existem no total
                const { count: totalGames, error: gamesError } = await supabase
                    .from("boardgames")
                    .select("*", { count: "exact", head: true });

                if (gamesError) {
                    console.log("Erro ao contar jogos totais:", gamesError);
                } else {
                    setTotalGames(totalGames ?? 0);
                }
            }
        };

        fetchUserAndProfile();
    }, [supabase]);

    // Reseta a seção de admin quando muda de aba
    useEffect(() => {
        if (activeTab !== 'gerenciar') {
            setAdminSection('menu');
        }
    }, [activeTab]);

    return (
        <>
            {/* Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 flex flex-col items-center sm:px-6 lg:px-8">
                    <nav className="flex space-x-2 " aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors  flex flex-col items-center ${activeTab === 'profile'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <CircleUser className="w-4 h-4" />
                            Perfil
                        </button>
                        <button
                            onClick={() => setActiveTab('jogos')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex flex-col items-center ${activeTab === 'jogos'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Dices className="w-4 h-4" />
                            Acervo
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors  flex flex-col items-center ${activeTab === 'register'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <ClipboardList className="w-4 h-4" />
                            Registro
                        </button>
                    </nav>
                </div>
            </div>

            {/* Conteúdo das abas */}
            <main className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-2 py-2">
                {activeTab === 'jogos' && (
                    <div>
                        <div className="mb-6 px-1">
                            <p className="text-gray-600 mt-2">
                                <i>&quot;Prepara, menina, é sua vez de brilhar!&quot;</i> 🌟
                            </p>
                            <p className="text-gray-600 ml-5 text-md">
                                <b>Marque aqui os jogos que você sabe ensinar 👨🏾‍🏫</b>
                            </p>
                        </div>
                        <BoardgameList />
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-gray-600 text-center mb-6 text-2xl font-bold">
                                Meu Perfil
                            </h2>
                            <p className="text-gray-600 mt-2">
                                <i>&quot;It&apos;s me... {name}!&quot;</i> 🍄
                            </p>
                            <p className="text-gray-600 ml-5 text-md">
                                <b>Aqui estão suas informações pessoais 💁🏽‍♀️</b>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">
                                    <p>Nome: {name}</p>
                                    <p>Email: {userEmail}</p>
                                </h3>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-sm font-medium text-gray-500">
                                    Sei ensinar {teachCount ?? 0} jogo{teachCount === 1 ? '' : 's'} dentre os {totalGames} jogos no Acervo. Um total de{' '}
                                    {totalGames > 0 ? ((teachCount / totalGames) * 100).toFixed(0) : 0}%!
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'register' && (
                    <div>
                        <TeachingSessionLog />
                    </div>
                )}
            </main>
        </>
    );
}
