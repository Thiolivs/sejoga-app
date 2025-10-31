'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { EditGameForm } from './EditGameForm';

interface Game {
    id: string;
    name: string;
    publisher?: string;
    active: boolean;
    copies: number;
}

export function AdminGamesList() {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingGameId, setEditingGameId] = useState<string | null>(null);
    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        const { data, error } = await supabase
            .from('boardgames')
            .select('id, name, publisher, active, copies')
            .order('name');

        if (!error && data) {
            setGames(data);
        }
        setLoading(false);
    };

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
            <h2 className="text-2xl font-bold">Todos os Jogos ({games.length})</h2>

            <div className="grid gap-2">
                {games.map((game) => (
                    <div
                        key={game.id}
                        className={`p-3 rounded-lg border ${game.active ? 'bg-white' : 'bg-gray-100'
                            }`}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="font-semibold text-md">{game.name}</h3>
                                    {game.publisher && (
                                        <>
                                            <span className="text-gray-400">•</span>
                                            <p className="text-sm text-gray-500 italic">{game.publisher}</p>
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
                ))}
            </div>
        </div>
    );
}