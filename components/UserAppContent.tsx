'use client';

import { TeachingSessionLog } from '@/components/TeachingSessionLog';
import { MySeJogaSession } from '@/components/MySeJogaSession';
import { TrainingSession } from '@/components/TrainingSession';
import { StatisticsSession } from '@/components/StatisticsSession';

import { User, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect } from 'react';
import { BoardgameList } from '@/components/BoardgameList';
import { useUserRole } from '@/hooks/useUserRole';


import { CircleUser, ClipboardList, Calendar, BarChart, Dices, Heart, Star, TrendingUp, ChartBarIncreasing, ChartColumnIncreasingIcon, ChartBarBig, ChartNoAxesColumnIncreasing, ChartNoAxesCombined } from "lucide-react"


type Tab = 'training' | 'profile' | 'jogos' | 'register' | 'statistics';
//type AdminSection = 'menu' | 'add-game' | 'manage-games' | 'manage-events' | 'manage-users';

interface UserAppContentProps {
    userEmail: string;
}

export function UserAppContent({ userEmail }: UserAppContentProps) {
    const [activeTab, setActiveTab] = useState<Tab>('jogos');
    //const [adminSection, setAdminSection] = useState<AdminSection>('menu');
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
    /*useEffect(() => {
        if (activeTab !== 'gerenciar') {
            setAdminSection('menu');
        }
    }, [activeTab]);*/

    return (
        <>
            {/* Tabs */}
            <div className="bg-white/70">
                <div className="max-w2xl mx-auto flex flex-col items-center sm:px-6 lg:px-8">
                    <nav className="flex space-x-1 " aria-label="Tabs">


                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors  flex flex-col items-center ${activeTab === 'profile'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Star className="w-4 h-4" />
                            Meu SeJoga
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

                        <button
                            onClick={() => setActiveTab('jogos')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex flex-col items-center ${activeTab === 'jogos'
                                ? 'border-sejoga-verde-oficial text-sejoga-verde-oficial'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Dices className="w-4 h-4" />
                            Acervo
                        </button>

                        <button
                            onClick={() => setActiveTab('training')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors  flex flex-col items-center ${activeTab === 'training'
                                ? 'border-sejoga-azul-oficial text-sejoga-azul-oficial'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            Treinamentos
                        </button>


                        <button
                            onClick={() => setActiveTab('statistics')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors  flex flex-col items-center ${activeTab === 'statistics'
                                ? 'border-sejoga-rosa-oficial text-sejoga-rosa-oficial'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <ChartNoAxesCombined className="w-4 h-4" />
                            Dados
                        </button>


                    </nav>
                </div>
            </div>

            {/* Conteúdo das abas */}
            <main className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-2 py-2">

                {/* JOGOS */}
                {activeTab === 'jogos' && (
                    <div>
                        <BoardgameList />
                    </div>
                )}

                {/* PERFIL */}
                {activeTab === 'profile' && (
                    <div>
                        <MySeJogaSession />
                    </div>
                )}

                {/* REGISTRO */}
                {activeTab === 'register' && (
                    <div>
                        <TeachingSessionLog />
                    </div>
                )}

                {/* TREINAMENTOS */}
                {activeTab === 'training' && (
                    <div>
                        <TrainingSession />
                    </div>
                )}


                {/* ESTATISTICAS */}
                {activeTab === 'statistics' && (
                    <div>
                        <StatisticsSession />
                    </div>
                )}
            </main>
        </>
    );
}
