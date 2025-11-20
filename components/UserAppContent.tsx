'use client';

import { TeachingSessionLog } from '@/components/TeachingSessionLog';
import { MySeJogaSession } from '@/components/MySeJogaSession';
import { TrainingSession } from '@/components/TrainingSession';
import { StatisticsSession } from '@/components/StatisticsSession';

import { createClient } from '@/lib/supabase'; 
import type { User } from '@supabase/supabase-js'; 
import { BoardgameList } from '@/components/BoardgameList';
import { useUserRole } from '@/hooks/useUserRole';

import { CircleUser, ClipboardList, Calendar, BarChart, Dices, Heart, Star, TrendingUp, ChartBarIncreasing, ChartColumnIncreasingIcon, ChartBarBig, ChartNoAxesColumnIncreasing, ChartNoAxesCombined } from "lucide-react"
import { useEffect, useState } from 'react';

type Tab = 'training' | 'profile' | 'jogos' | 'register' | 'statistics';

interface UserAppContentProps {
    userEmail: string;
}

export function UserAppContent({ userEmail }: UserAppContentProps) {
    const [activeTab, setActiveTab] = useState<Tab>('jogos');
    const { isAdmin } = useUserRole();
    const { isMonitor } = useUserRole();
    const supabase = createClient(); // ✅ Usando a função do lib/supabase/client
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [teachCount, setTeachCount] = useState(0);
    const [totalGames, setTotalGames] = useState(0);

    // ✅ MUDANÇA: Carrega aba salva apenas se estiver em "sessão ativa"
    useEffect(() => {
        // Verifica se é uma "sessão ativa" (não é primeiro acesso)
        const isActiveSession = sessionStorage.getItem('sejoga-session-active');

        if (isActiveSession === 'true') {
            // Está na mesma sessão, carrega aba salva
            const savedTab = localStorage.getItem('userapp-active-tab');
            if (savedTab && ['training', 'profile', 'jogos', 'register', 'statistics'].includes(savedTab)) {
                setActiveTab(savedTab as Tab);
            }
        } else {
            // Primeira vez abrindo, marca como sessão ativa
            sessionStorage.setItem('sejoga-session-active', 'true');
            // Já começa em 'jogos' (estado inicial)
        }
    }, []);

    // Função para mudar de aba e salvar no localStorage
    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        localStorage.setItem('userapp-active-tab', tab);
    };

    // ✅ MUDANÇA: Limpa tanto localStorage quanto sessionStorage ao desmontar
    useEffect(() => {
        return () => {
            localStorage.removeItem('userapp-active-tab');
            sessionStorage.removeItem('sejoga-session-active');
        };
    }, []);

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

    return (
        <>
            {/* Tabs */}
            <div className="bg-white/70">
                <div className="max-w2xl mx-auto flex flex-col items-center sm:px-6 lg:px-8">
                    <nav className="flex" aria-label="Tabs">
                        <button
                            onClick={() => handleTabChange('profile')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex flex-col items-center ${activeTab === 'profile'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Star className="w-4 h-4" />
                            Meu SeJoga
                        </button>

                        <button
                            onClick={() => handleTabChange('register')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex flex-col items-center ${activeTab === 'register'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <ClipboardList className="w-4 h-4" />
                            Registro
                        </button>

                        <button
                            onClick={() => handleTabChange('jogos')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex flex-col items-center ${activeTab === 'jogos'
                                    ? 'border-sejoga-verde-oficial text-sejoga-verde-oficial'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Dices className="w-4 h-4" />
                            Acervo
                        </button>

                        <button
                            onClick={() => handleTabChange('training')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex flex-col items-center ${activeTab === 'training'
                                    ? 'border-sejoga-azul-oficial text-sejoga-azul-oficial'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            Treinamentos
                        </button>

                        <button
                            onClick={() => handleTabChange('statistics')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex flex-col items-center ${activeTab === 'statistics'
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
                {activeTab === 'jogos' && (
                    <div>
                        <BoardgameList />
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div>
                        <MySeJogaSession />
                    </div>
                )}

                {activeTab === 'register' && (
                    <div>
                        <TeachingSessionLog />
                    </div>
                )}

                {activeTab === 'training' && (
                    <div>
                        <TrainingSession />
                    </div>
                )}

                {activeTab === 'statistics' && (
                    <div>
                        <StatisticsSession />
                    </div>
                )}
            </main>
        </>
    );
}