'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { EditGameForm } from './EditGameForm';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

interface Game {
    id: string;
    name: string;
    publisher?: string; // campo antigo (texto)
    publisher_id?: string; // campo novo (UUID)
    publishers?: { // ✅ Supabase retorna como array ou objeto único
        name: string;
    }[] | { name: string; } | null;
    active: boolean;
    copies: number;
}

export function ManageGames() {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingGameId, setEditingGameId] = useState<string | null>(null);
    const supabase = createClientComponentClient();
    const router = useRouter();

    const fetchGames = useCallback(async () => {
        // ✅ CORREÇÃO: Fazer JOIN com publishers
        const { data, error } = await supabase
            .from('boardgames')
            .select(`
                id, 
                name, 
                publisher, 
                publisher_id,
                active, 
                copies,
                publishers (
                    name
                )
            `)
            .order('name');

        if (!error && data) {
            // ✅ Type assertion para garantir tipagem correta
            setGames(data as unknown as Game[]);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    const handleDelete = async (gameId: string, gameName: string) => {
        if (!confirm(`Tem certeza que deseja deletar "${gameName}"?`)) return;

        const { error } = await supabase
            .from('boardgames')
            .delete()
            .eq('id', gameId);

        if (error) {
            alert(`Erro ao deletar: ${error.message}`);
        } else {
            alert('✅ Jogo deletado com sucesso!');
            fetchGames();
        }
    };

    // ✅ Função para pegar o nome da editora (prioriza o novo sistema)
    const getPublisherName = (game: Game): string | undefined => {
        // Prioriza o nome da editora via JOIN (novo sistema)
        if (game.publishers) {
            // Se for array, pega o primeiro elemento
            if (Array.isArray(game.publishers) && game.publishers.length > 0) {
                return game.publishers[0].name;
            }
            // Se for objeto único
            if (typeof game.publishers === 'object' && 'name' in game.publishers) {
                return game.publishers.name;
            }
        }
        // Fallback para o campo antigo (texto)
        return game.publisher;
    };

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (editingGameId) {
        return (
            <EditGameForm
                gameId={editingGameId}
                onSuccess={() => {
                    setEditingGameId(null);
                    fetchGames();
                }}
                onCancel={() => setEditingGameId(null)}
            />
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl text-center font-bold text-blue-800 flex-1 mb-6">✨<i>Gerenciamento de Jogos</i>✨</h1>

            <div className="flex flex-col items-center rounded-lg border-1 p-3 gap-4 mb-8">
                <Button
                    onClick={() => router.push('/user-app/administration/add-game')}
                    className="flex items-center gap-2 bg-sejoga-azul-oficial hover:bg-blue-500"
                >
                    <Plus className="w-4 h-4" />
                    Cadastrar Novo Jogo
                </Button>

                <div className='flex gap-5 justify-center'>
                    <Button
                        variant={"outline"}
                        onClick={() => router.push('/user-app/administration/manage-publishers')}
                        className="flex items-center gap-2"
                    >
                        Gerenciar Editoras
                    </Button>
                    <Button
                        variant={"outline"}
                        onClick={() => router.push('/user-app/administration/manage-mechanics')}
                        className="flex items-center gap-2"
                    >
                        Gerenciar Mecânicas
                    </Button>
                </div>
            </div>
            <h2 className="text-1xl font-semibold">Todos os Jogos ({games.length})</h2>

            <div className="grid gap-2">
                {games.map((game) => {
                    const publisherName = getPublisherName(game); // ✅ Usar função auxiliar
                    
                    return (
                        <div
                            key={game.id}
                            className={`p-3 rounded-lg border ${game.active ? 'bg-white' : 'bg-gray-100'
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="font-semibold text-md">{game.name}</h3>
                                        {publisherName && (
                                            <>
                                                <span className="text-gray-400">•</span>
                                                <p className="text-sm text-gray-500 italic">{publisherName}</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        {!game.active && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                                                Inativo
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingGameId(game.id)}
                                    >
                                        ✏️ Editar
                                    </Button>

                                    <div className="flex flex-col justify-center items-center border-l border-gray-200 pl-1 ml-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(game.id, game.name)}
                                            className="text-red-600 hover:text-red-800 translate-x-1"
                                        >
                                            ❌
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
