import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { BoardgameWithTeachers, Profile } from '@/types/database';
import { useGameLoans } from './useGameLoans';

export function useBoardgames(userId?: string) {
    const [boardgames, setBoardgames] = useState<BoardgameWithTeachers[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();
    const { loans, isGameLoaned, isLoanedByMe } = useGameLoans();

    useEffect(() => {
        fetchBoardgames();
    }, [userId]);

    // Realtime: escuta mudanças em game_loans e atualiza os cards em tempo real
    useEffect(() => {
        if (!userId) {
            console.log('⏳ Realtime aguardando userId...');
            return;
        }

        console.log('✅ Inscrevendo Realtime com userId:', userId);

        const channel = supabase
            .channel('game_loans_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'game_loans' },
                (payload) => {
                    console.log('🔔 Realtime evento:', payload.eventType, payload);

                    const novo = payload.new as {
                        boardgame_id?: string;
                        user_id?: string;
                        borrowed_at?: string;
                        returned_at?: string | null;
                    } | null;
                    const antigo = payload.old as { boardgame_id?: string } | null;

                    if (payload.eventType === 'INSERT' && novo?.boardgame_id) {
                        setBoardgames(prev =>
                            prev.map(game =>
                                game.id === novo.boardgame_id
                                    ? { ...game, isLoaned: true, loanedBy: novo.user_id, borrowedAt: novo.borrowed_at }
                                    : game
                            )
                        );
                    }

                    if (payload.eventType === 'UPDATE' && novo?.boardgame_id) {
                        const foiDevolvido = !!novo.returned_at;
                        setBoardgames(prev =>
                            prev.map(game =>
                                game.id === novo.boardgame_id
                                    ? { ...game, isLoaned: !foiDevolvido, loanedBy: foiDevolvido ? undefined : novo.user_id, borrowedAt: foiDevolvido ? undefined : novo.borrowed_at }
                                    : game
                            )
                        );
                    }

                    if (payload.eventType === 'DELETE' && antigo?.boardgame_id) {
                        setBoardgames(prev =>
                            prev.map(game =>
                                game.id === antigo.boardgame_id
                                    ? { ...game, isLoaned: false, loanedBy: undefined, borrowedAt: undefined }
                                    : game
                            )
                        );
                    }
                }
            )
            .subscribe((status) => {
                console.log('📡 Status do canal Realtime:', status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const fetchBoardgames = async () => {
        try {
            setLoading(true);

            // ✅ CORREÇÃO: Busca todos os jogos ativos COM suas mecânicas E editora
            const { data: games, error: gamesError } = await supabase
                .from('boardgames')
                .select(`
                    *,
                    publishers (
                        name
                    ),
                    boardgame_mechanics(
                        mechanic_id,
                        game_mechanics(*)
                    )
                `)
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

            // Combina dados com loan e mecânicas
            const gamesWithInfo = games?.map(game => {
                const loan = loansMap.get(game.id);

                // Extrai as mecânicas do relacionamento
                const mechanics = game.boardgame_mechanics?.map((bm: any) => bm.game_mechanics).filter(Boolean) || [];

                // ✅ Pega o nome da editora (prioriza novo sistema com JOIN)
                let publisherName = game.publisher; // Fallback para campo antigo
                if (game.publishers) {
                    // Supabase pode retornar array ou objeto
                    if (Array.isArray(game.publishers) && game.publishers.length > 0) {
                        publisherName = game.publishers[0].name;
                    } else if (typeof game.publishers === 'object' && 'name' in game.publishers) {
                        publisherName = game.publishers.name;
                    }
                }

                return {
                    ...game,
                    publisher: publisherName, // ✅ Sobrescreve com o nome correto
                    mechanics, // Adiciona as mecânicas ao jogo
                    canTeach: userTeaches.includes(game.id),
                    isLoaned: !!loan,
                    loanedBy: loan?.user_id,
                    borrowedAt: loan?.borrowed_at,
                    dueDate: loan?.due_date,
                };
            }) || [];

            setBoardgames(gamesWithInfo as any); // Type assertion necessária por causa do publishers
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
                .select('id, first_name, last_name, email, role')
                .in('id', userIds);

            if (profilesError) throw profilesError;

            return profiles || [];
        } catch (err) {
            console.error('Erro ao buscar professores:', err);
            return [];
        }
    };

    const updateSingleGame = (
        boardgameId: string,
        updates: Partial<BoardgameWithTeachers>
    ) => {
        setBoardgames(prev =>
            prev.map(game =>
                game.id === boardgameId
                    ? { ...game, ...updates }
                    : game
            )
        );
    };

    return {
        boardgames,
        loading,
        error,
        toggleTeach,
        getGameTeachers,
        refetch: fetchBoardgames,
        updateSingleGame,
    };
}