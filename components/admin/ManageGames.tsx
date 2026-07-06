'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
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
const supabase = createClient();
    const router = useRouter();

    const fetchGames = useCallback(async () => {

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

    const getPublisherName = (game: Game): string | undefined => {
        if (game.publishers) {
            if (Array.isArray(game.publishers) && game.publishers.length > 0) {
                return game.publishers[0].name;
            }
            if (typeof game.publishers === 'object' && 'name' in game.publishers) {
                return game.publishers.name;
            }
        }
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
        <div className="space-y-4 bg-white/95 rounded-lg p-4">
            <div className="text-[35px] font-aladin text-center text-blue-800 flex-1 mb-5">
                Gerenciamento de Jogos
            </div>

            <div className="flex flex-col items-center rounded-lg border p-2 gap-4 mb-4">
                <div className="flex gap-5 justify-center">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/user-app/administration/manage-publishers')}
                        className="flex items-center gap-2"
                    >
                        Gerenciar Editoras
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/user-app/administration/manage-mechanics')}
                        className="flex items-center gap-2"
                    >
                        Gerenciar Tags
                    </Button>
                </div>
            </div>

            {/* 🔹 Linha com título e botão lado a lado */}
            <div className="flex items-center justify-between mb-6 mt-8 ">
                <h2 className="text-sm font-semibold">
                    Todos os Jogos ({games.length})
                </h2>

                <Button
                    onClick={() => router.push('/user-app/administration/add-game')}
                    className="flex items-center gap-2 bg-sejoga-azul-oficial hover:bg-blue-500"
                >
                    <Plus className="w-4 h-4" />
                    Novo Jogo
                </Button>
            </div>

            <div className="grid gap-2">
                {games.map((game) => {
                    const publisherName = getPublisherName(game);

                    return (
                        <div
                            key={game.id}
                            className={`p-3 text-sm rounded-lg border ${game.active ? 'bg-white' : 'bg-gray-100'}`}
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-baseline gap-x-2">
                                        <h3 className="font-semibold text-md">{game.name}</h3>
                                        {/* {publisherName && (
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-gray-400">•</span>
                                                <p className="text-sm text-gray-500 italic">{publisherName}</p>
                                            </div>
                                        )}*/}
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        {!game.active && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                                                Inativo
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-1 flex-shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingGameId(game.id)}
                                    >
                                        ✏️ Editar
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(game.id, game.name)}
                                        className="text-red-600 hover:text-red-800 px-2"
                                    >
                                        ❌
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
