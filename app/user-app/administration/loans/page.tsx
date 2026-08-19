'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ArrowLeft, Package } from 'lucide-react';

interface ActiveLoan {
    id: string;
    borrowed_at: string;
    jogo: string;
    monitor: string;
}

export default function LoansPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loans, setLoans] = useState<ActiveLoan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const carregar = async () => {
            try {
                setLoading(true);

                // Empréstimos ativos (não devolvidos), com jogo e quem pegou
                const { data, error } = await supabase
                    .from('game_loans')
                    .select(`
                        id,
                        borrowed_at,
                        boardgames ( name ),
                        profiles ( first_name, last_name )
                    `)
                    .is('returned_at', null)
                    .order('borrowed_at', { ascending: false });

                if (error) throw error;

                const lista: ActiveLoan[] = (data || []).map((row: any) => {
                    const jogoObj = Array.isArray(row.boardgames) ? row.boardgames[0] : row.boardgames;
                    const perfilObj = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
                    const nomeMonitor = perfilObj
                        ? `${perfilObj.first_name || ''} ${perfilObj.last_name || ''}`.trim()
                        : 'Desconhecido';
                    return {
                        id: row.id,
                        borrowed_at: row.borrowed_at,
                        jogo: jogoObj?.name || 'Jogo',
                        monitor: nomeMonitor,
                    };
                });

                setLoans(lista);
            } catch (err) {
                console.error('Erro ao carregar empréstimos:', err);
            } finally {
                setLoading(false);
            }
        };
        carregar();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <button
                        onClick={() => router.push('/user-app')}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="w-6 h-6" />
                        Empréstimos
                    </h1>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                        <p className="text-gray-600">Carregando...</p>
                    </div>
                ) : loans.length === 0 ? (
                    <div className="bg-white border rounded-lg p-8 text-center">
                        <p className="text-gray-500">Nenhum jogo emprestado no momento.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-600 mb-3">
                            <strong>{loans.length}</strong>{' '}
                            {loans.length === 1 ? 'jogo emprestado' : 'jogos emprestados'}
                        </p>
                        <div className="space-y-2">
                            {loans.map((e) => {
                                const data = new Date(e.borrowed_at);
                                const dataFmt = data.toLocaleDateString('pt-BR');
                                const horaFmt = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                return (
                                    <div key={e.id} className="bg-white border rounded-lg p-3 flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-sm break-words">{e.jogo}</h3>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                Com <strong>{e.monitor}</strong>
                                            </p>
                                        </div>
                                        <div className="text-right flex-none">
                                            <p className="text-xs text-gray-700">{dataFmt}</p>
                                            <p className="text-[11px] text-gray-500">{horaFmt}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}