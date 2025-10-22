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

type Tab = 'jogos' | 'meu-sejoga' | 'evento' | 'gerenciar' | 'registro';
type AdminSection = 'menu' | 'add-game' | 'manage-games' | 'manage-users';

interface UserAppContentProps {
    userEmail: string;
}

export function UserAppContent({ userEmail }: UserAppContentProps) {
    const [activeTab, setActiveTab] = useState<Tab>('jogos');
    const [adminSection, setAdminSection] = useState<AdminSection>('menu');
    const { isAdmin } = useUserRole();
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

                // 👇 Conta quantos jogos o usuário sabe ensinar
                const { count: teachCount, error: teachesError } = await supabase
                    .from("user_teaches_game")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", user.id);

                if (teachesError) {
                    console.log("Erro ao contar jogos ensinados:", teachesError);
                } else {
                    setTeachCount(teachCount ?? 0);
                }

                // 👇 Conta quantos jogos existem no total
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-2" aria-label="Tabs">
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
                            onClick={() => setActiveTab('meu-sejoga')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'meu-sejoga'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Meu SeJoga
                        </button>
                        <button
                            onClick={() => setActiveTab('registro')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'registro'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Ensino
                        </button>
                        Forms
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

                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('evento')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'evento'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Seleção Evento
                        </button>
                    )}
                </nav>
            </div>
        </div >

            {/* Conteúdo das abas */ }
            < main className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-2" >
                { activeTab === 'jogos' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-gray-600 text-center mb-6 text-2xl font-bold">
                                Todos os Jogos
                            </h2>
                            <p className="text-gray-600 mt-2">
                                <i>&quot;Prepara, menina, é sua vez de brilhar!&quot;</i> 🌟
                            </p>
                            <p className="text-gray-600 ml-5 text-md">
                                <b>Marque aqui os jogos que você sabe ensinar 👨🏾‍🏫</b>
                            </p>
                        </div>
                        <BoardgameList />
                    </div>
                )
}

{
    activeTab === 'meu-sejoga' && (
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
                        Sei ensinar {teachCount ?? 0} jogo{teachCount === 1 ? '' : 's'} dentre os {totalGames} jogos no Acervo. Um total de {totalGames > 0 ? ((teachCount / totalGames) * 100).toFixed(0) : 0}%!
                    </h3>
                </div>
            </div>
        </div>
    )
}

{
    activeTab === 'evento' && isAdmin && (
        <div>
            <EventGameSelection />
        </div>
    )
}

{
    activeTab === 'registro' && isMonitor && (
        <div>
            <TeachingSessionLog />
        </div>
    )
}

{activeTab === 'gerenciar' && adminSection === 'menu' && (
  <button
    onClick={() => setAdminSection('manage-events')}
    className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-lg p-8 transition-all hover:scale-105 text-left"
  >
    <div className="text-4xl mb-4">📅</div>
    <h3 className="text-xl font-bold mb-2">Gerenciar Eventos</h3>
    <p className="text-orange-100 text-sm">
      Criar e gerenciar eventos do SeJoga
    </p>
  </button>
)}

{adminSection === 'manage-events' && (
  <div className="animate-fadeIn">
    <EventManagement />
  </div>
)}

{/* ABA GERENCIAR - NOVO LAYOUT */ }
{
    activeTab === 'gerenciar' && isAdmin && (
        <div>
            {/* Breadcrumb para navegação */}
            {adminSection !== 'menu' && (
                <button
                    onClick={() => setAdminSection('menu')}
                    className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    ← Voltar ao menu
                </button>
            )}

            {/* MENU PRINCIPAL */}
            {adminSection === 'menu' && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Painel de Administração
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Gerencie jogos, usuários e permissões
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Card: Adicionar Jogo */}
                        <button
                            onClick={() => setAdminSection('add-game')}
                            className="bg-sejoga-azul-oficial text-white rounded-lg shadow-lg p-3 transition-all hover:scale-105 text-center"
                        >
                            <h3 className="text-lg font-bold mb-1">
                                ➕ Adicionar Novo Jogo
                            </h3>
                            <p className="text-blue-100 text-xs">
                                Cadastrar um novo boardgame no sistema
                            </p>
                        </button>

                        {/* Card: Gerenciar Jogos */}
                        <button
                            onClick={() => setAdminSection('manage-games')}
                            className="bg-sejoga-rosa-oficial text-white rounded-lg shadow-lg p-3 transition-all hover:scale-105 text-center"

                        >
                            <h3 className="text-lg font-bold mb-1">
                                🎲 Gerenciar Jogos
                            </h3>
                            <p className="text-green-100 text-xs">
                                Editar, remover ou visualizar jogos existentes
                            </p>
                        </button>
                        {/* Card: Gerenciar Usuários */}
                        <button
                            onClick={() => setAdminSection('manage-users')}
                            className="bg-sejoga-verde-oficial text-white rounded-lg shadow-lg p-3 transition-all hover:scale-105 text-center"
                        >
                            <h3 className="text-lg font-bold mb-1">
                                👥 Gerenciar Usuários
                            </h3>
                            <p className="text-purple-100 text-xs">
                                Ver, promover ou gerenciar permissões
                            </p>
                        </button>
                    </div>
                </div>
            )}

            {/* SEÇÃO: ADICIONAR JOGO */}
            {adminSection === 'add-game' && (
                <div className="animate-fadeIn">
                    <AddGameForm
                        onSuccess={() => {
                            setAdminSection('menu');
                        }}
                    />
                </div>
            )}

            {/* SEÇÃO: GERENCIAR JOGOS */}
            {adminSection === 'manage-games' && (
                <div className="animate-fadeIn">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Gerenciar Jogos
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Edite ou remova jogos existentes
                        </p>
                    </div>
                    <AdminGamesList />
                </div>
            )}

            {/* SEÇÃO: GERENCIAR USUÁRIOS */}
            {adminSection === 'manage-users' && (
                <div className="animate-fadeIn">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Gerenciar Usuários
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Veja todos os usuários e gerencie permissões
                        </p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <p className="text-yellow-800">
                            🚧 Em desenvolvimento - Em breve você poderá gerenciar usuários aqui
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
            </main >
        </>
    );
}