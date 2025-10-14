import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { BoardgameWithTeachers, Profile } from '@/types/database';
import { useGameLoans } from './useGameLoans';

export function useBoardgames(userId?: string) {
    const [boardgames, setBoardgames] = useState<BoardgameWithTeachers[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClientComponentClient();
    const { loans, isGameLoaned, isLoanedByMe } = useGameLoans();

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

        // BUSCA OS LOANS DIRETAMENTE DO BANCO (não usa o Map de useGameLoans)
        const { data: loansData, error: loansError } = await supabase
            .from('game_loans')
            .select('*')
            .is('returned_at', null);

        if (loansError) {
            console.error('Erro ao buscar loans:', loansError);
        }

        // Cria um Map local com os loans
        const loansMap = new Map<string, any>();
        loansData?.forEach(loan => {
            loansMap.set(loan.boardgame_id, loan);
        });


        // Se userId, busca games que o usuário pode ensinar
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

        // Combina dados com loan
        const gamesWithInfo = games?.map(game => {
            const loan = loansMap.get(game.id);
            return {
                ...game,
                canTeach: userTeaches.includes(game.id),
                isLoaned: !!loan,
                loanedBy: loan?.user_id,
                borrowedAt: loan?.borrowed_at,
                dueDate: loan?.due_date,
            };
        }) || [];

        setBoardgames(gamesWithInfo);
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
                const { error } = await supabase
                    .from('user_teaches_game')
                    .delete()
                    .eq('user_id', userId)
                    .eq('boardgame_id', boardgameId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('user_teaches_game')
                    .insert({ user_id: userId, boardgame_id: boardgameId });

                if (error) throw error;
            }

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
            const { data: teachData, error: teachError } = await supabase
                .from('user_teaches_game')
                .select('user_id')
                .eq('boardgame_id', boardgameId);

            if (teachError) throw teachError;
            if (!teachData || teachData.length === 0) return [];

            const userIds = teachData.map(t => t.user_id);

            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, name, email, role')
                .in('id', userIds);

            if (profilesError) throw profilesError;

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
        refetch: fetchBoardgames,
    };
}