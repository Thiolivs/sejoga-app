import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { GameLoan, Profile } from '@/types/database';

export function useGameLoans() {
    const [loans, setLoans] = useState<Map<string, GameLoan>>(new Map());
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchActiveLoans();
        subscribeToLoans();
    }, []);

    const fetchActiveLoans = async () => {
    try {
        
        const { data, error } = await supabase
            .from('game_loans')
            .select('*')
            .is('returned_at', null);

        if (error) throw error;


        const loansMap = new Map<string, GameLoan>();
        data?.forEach(loan => {
            loansMap.set(loan.boardgame_id, loan);
        });

        
        // Retorna uma promise que resolve quando setState terminar
        return new Promise<void>((resolve) => {
            setLoans(loansMap);
            // Aguarda o próximo tick para garantir que o estado foi atualizado
            setTimeout(() => resolve(), 0);
        });
    } catch (err) {
        console.error('Erro ao buscar empréstimos:', err);
    } finally {
        setLoading(false);
    }
};

    const subscribeToLoans = () => {
        // REALTIME: Listen changes on table game_loans
        const channel = supabase
            .channel('game_loans_changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'game_loans',
                },
                (payload) => {
                    console.log('🔄 Mudança em empréstimo:', payload);

                    if (payload.eventType === 'INSERT') {
                        const newLoan = payload.new as GameLoan;
                        if (!newLoan.returned_at) {
                            setLoans(prev => new Map(prev).set(newLoan.boardgame_id, newLoan));
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedLoan = payload.new as GameLoan;
                        if (updatedLoan.returned_at) {
                            // board not returned
                            setLoans(prev => {
                                const newMap = new Map(prev);
                                newMap.delete(updatedLoan.boardgame_id);
                                return newMap;
                            });
                        } else {
                            setLoans(prev => new Map(prev).set(updatedLoan.boardgame_id, updatedLoan));
                        }
                    } else if (payload.eventType === 'DELETE') {
                        const deletedLoan = payload.old as GameLoan;
                        setLoans(prev => {
                            const newMap = new Map(prev);
                            newMap.delete(deletedLoan.boardgame_id);
                            return newMap;
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const borrowGame = async (boardgameId: string, userId: string, dueDate?: Date) => {
        try {
            const { data, error } = await supabase
                .from('game_loans')
                .insert({
                    boardgame_id: boardgameId,
                    user_id: userId,
                    due_date: dueDate?.toISOString(),
                })
                .select()
                .single();

            if (error) throw error;

            return { success: true, loan: data };
        } catch (err: any) {
            console.error('Erro ao emprestar jogo:', err);
            alert("O jogo está emprestado. Recarregue a página ")
            return {
                success: false,
                error: err.message || 'Erro ao emprestar jogo'
            };
        }
    };

    const returnGame = async (boardgameId: string) => {
        try {
            const loan = loans.get(boardgameId);
            if (!loan) {
                throw new Error('Empréstimo não encontrado');
            }

            const { error } = await supabase
                .from('game_loans')
                .update({ returned_at: new Date().toISOString() })
                .eq('id', loan.id);

            if (error) throw error;

            return { success: true };
        } catch (err: any) {
            console.error('Erro ao devolver jogo:', err);
            return {
                success: false,
                error: err.message || 'Erro ao devolver jogo'
            };
        }
    };

    const getLoanInfo = async (boardgameId: string): Promise<{ loan: GameLoan | null; borrower: Profile | null }> => {
        const loan = loans.get(boardgameId);
        if (!loan) {
            return { loan: null, borrower: null };
        }

        try {
            const { data: borrower, error } = await supabase
                .from('profiles')
                .select('id, name, email, role')
                .eq('id', loan.user_id)
                .single();

            if (error) throw error;

            return { loan, borrower };
        } catch (err) {
            console.error('Erro ao buscar info do empréstimo:', err);
            return { loan, borrower: null };
        }
    };

    const isGameLoaned = (boardgameId: string): boolean => {
        return loans.has(boardgameId);
    };

    const isLoanedByMe = (boardgameId: string, userId?: string): boolean => {
        if (!userId) return false;
        const loan = loans.get(boardgameId);
        return loan?.user_id === userId;
    };

    return {
        loans,
        loading,
        borrowGame,
        returnGame,
        getLoanInfo,
        isGameLoaned,
        isLoanedByMe,
        refetchLoans: fetchActiveLoans, 

    };
}