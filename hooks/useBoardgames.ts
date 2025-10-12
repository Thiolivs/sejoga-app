import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { BoardgameWithTeachers, Profile } from '@/types/database';

export function useBoardgames(userId?: string) {
    const [boardgames, setBoardgames] = useState<BoardgameWithTeachers[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchBoardgames();
    }, [userId]);

    const fetchBoardgames = async () => {
        try {
            setLoading(true);

            // Busca todos os jogos ativos
            const { data: games, error: gamesError } = await supabase
                .from('boardgames')
                .select('*')
                //.eq('active', true)
                .order('name');

            if (gamesError) throw gamesError;

            // Se tiver userId, busca os jogos que o usuário sabe ensinar
            let userTeaches: string[] = [];
            if (userId) {
                const { data: teachData, error: teachError } = await supabase
                    .from('user_teaches_game')
                    .select('boardgame_id')
                    .eq('user_id', userId);

                if (teachError) {
                    console.error('⚠️ Erro ao buscar user_teaches_game:', teachError);
                } else {
                    userTeaches = teachData?.map(t => t.boardgame_id) || [];
                }
            }

            // Combina os dados
            const gamesWithTeachStatus = games?.map(game => ({
                ...game,
                canTeach: userTeaches.includes(game.id)
            })) || [];

            setBoardgames(gamesWithTeachStatus);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar jogos');
        } finally {
            setLoading(false);
        }
    };

    const toggleTeach = async (boardgameId: string, canTeach: boolean) => {
        if (!userId) return;

        try {
            if (canTeach) {
                // Remove o relacionamento
                const { error } = await supabase
                    .from('user_teaches_game')
                    .delete()
                    .eq('user_id', userId)
                    .eq('boardgame_id', boardgameId);

                if (error) throw error;
            } else {
                // Adiciona o relacionamento
                const { error } = await supabase
                    .from('user_teaches_game')
                    .insert({ user_id: userId, boardgame_id: boardgameId });

                if (error) throw error;
            }

            // Atualiza o estado local
            setBoardgames(prev =>
                prev.map(game =>
                    game.id === boardgameId
                        ? { ...game, canTeach: !canTeach }
                        : game
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar');
        }
    };

    const getGameTeachers = async (boardgameId: string): Promise<Profile[]> => {
        try {
            // Passo 1: Buscar user_ids que ensinam este jogo
            const { data: teachData, error: teachError } = await supabase
                .from('user_teaches_game')
                .select('user_id')
                .eq('boardgame_id', boardgameId);

            if (teachError) {
                console.error('Erro ao buscar user_teaches_game:', teachError);
                throw teachError;
            }

            if (!teachData || teachData.length === 0) {
                return [];
            }

            // Passo 2: Buscar os perfis desses usuários
            const userIds = teachData.map(t => t.user_id);

            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, name, email')
                .in('id', userIds);

            if (profilesError) {
                console.error('Erro ao buscar profiles:', profilesError);
                throw profilesError;
            }

            return profiles || [];
        } catch (err) {
            console.error('Erro ao buscar professores:', err);
            return [];
        }
    };

    return {
        boardgames,
        loading,
        error,
        toggleTeach,
        getGameTeachers,
        refetch: fetchBoardgames
    };
}