'use client';

import { useState } from 'react';
import { useBoardgames } from '@/hooks/useBoardgames';
import { useUser } from '@/hooks/useUser';
import { useUserRole } from '@/hooks/useUserRole';
import { useGameLoans } from '@/hooks/useGameLoans';
import type { BoardgameWithTeachers, Profile } from '@/types/database';

export function BoardgameList() {
    const { user, loading: userLoading } = useUser();
    const { isAdmin, isMonitor, loading: roleLoading } = useUserRole();
    const { boardgames, loading, error, toggleTeach, getGameTeachers, refetch } = useBoardgames(user?.id);
    const { borrowGame, returnGame, getLoanInfo, refetchLoans } = useGameLoans();

    const [selectedGame, setSelectedGame] = useState<BoardgameWithTeachers | null>(null);
    const [teachers, setTeachers] = useState<Profile[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [borrower, setBorrower] = useState<Profile | null>(null);
    const [loadingBorrower, setLoadingBorrower] = useState(false);

    const handleGameClick = async (game: BoardgameWithTeachers) => {
        setSelectedGame(game);
        setLoadingTeachers(true);
        setLoadingBorrower(true);

        const teachersList = await getGameTeachers(game.id);
        setTeachers(teachersList);
        setLoadingTeachers(false);

        const { borrower: gameBorrower } = await getLoanInfo(game.id);
        setBorrower(gameBorrower);
        setLoadingBorrower(false);
    };

    const handleBorrow = async (boardgameId: string) => {
        if (!user) return;

        const result = await borrowGame(boardgameId, user.id);
        if (result.success) {
            //await new Promise(resolve => setTimeout(resolve, 50));
            await refetchLoans?.();
            //await new Promise(resolve => setTimeout(resolve, 50));
            await refetch();

            if (selectedGame?.id === boardgameId) {
                const { borrower: gameBorrower } = await getLoanInfo(boardgameId);
                setBorrower(gameBorrower);
            }
        }
    };

    const handleReturn = async (boardgameId: string) => {
        const result = await returnGame(boardgameId);
        if (result.success) {
            //await new Promise(resolve => setTimeout(resolve, 50));
            await refetchLoans?.();
            //await new Promise(resolve => setTimeout(resolve, 50));
            await refetch();

            if (selectedGame?.id === boardgameId) {
                setBorrower(null);
            }
        }
    };

    if (userLoading || loading || roleLoading) {
        return (
            <div className="p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
                <p className="text-center mt-4 text-gray-600">Carregando...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold">Erro ao carregar jogos</h3>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    if (boardgames.length === 0) {
        return (
            <div className="p-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <h3 className="text-yellow-800 font-semibold text-lg">Nenhum jogo encontrado</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                    {boardgames.length} {boardgames.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}
                </p>

                {(isAdmin || isMonitor) && (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${isAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}
                    >
                        {isAdmin ? 'Admin' : 'Monitor'}
                    </span>
                )}
            </div>

            {boardgames.map((game) => (
                <div
                    key={game.id}
                    className={`border rounded-lg p-4 transition-all ${game.isLoaned ? 'bg-red-50 border-red-300' : 'bg-white hover:shadow-md'
                        }`}
                >
                    {/* LINHA 1 - Nome + Tag */}
                    <div
                        className="flex items-center justify-between gap-4 cursor-pointer"
                        onClick={() => handleGameClick(game)}
                    >
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{game.name}</h3>

                            {game.isLoaned && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                                    ⚔️ Emprestado
                                </span>
                            )}
                        </div>
                    </div>

                    {/* LINHA 2 - Checkbox + Botão */}
                    {isMonitor && (
                        <div className="flex items-center justify-between mt-3">
                            {/* Checkbox e texto à esquerda */}
                            <div className="flex items-center gap-2 text-left">
                                <input
                                    type="checkbox"
                                    id={`teach-${game.id}`}
                                    checked={game.canTeach}
                                    onChange={() => toggleTeach(game.id, game.canTeach || false)}
                                    className="w-6 h-6 cursor-pointer"
                                />
                                <label
                                    htmlFor={`teach-${game.id}`}
                                    className="text-sm cursor-pointer select-none"
                                >
                                    Sei ensinar
                                </label>
                            </div>

                            <div>
                                {game.isLoaned ? (
                                    game.loanedBy === user?.id ? (
                                        <button
                                            onClick={() => handleReturn(game.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                        >
                                            👍 Devolver
                                        </button>
                                    ) : (
                                        <div className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed">
                                            🔒 Indisponível
                                        </div>
                                    )
                                ) : (
                                    <button
                                        onClick={() => handleBorrow(game.id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                    >
                                        🤏 Pegar Emprestado
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            ))}

            {selectedGame && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedGame(null)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold">{selectedGame.name}</h3>
                            <button
                                onClick={() => setSelectedGame(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            {selectedGame.isLoaned && (
                                <div className="bg-red-50 border text-center border-red-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-red-800 mb-2">
                                        ⚔️ Jogo Emprestado
                                    </h4>
                                    {loadingBorrower ? (
                                        <p className="text-sm text-red-600">Carregando...</p>
                                    ) : borrower ? (
                                        <div>
                                            <p className="text-sm text-red-700">
                                                Para: 👤<strong>{borrower.name}</strong>
                                            </p>
                                            {/*<p className="text-xs text-red-600 mt-1">
                                                {borrower.email}
                                            </p>*/}
                                            {selectedGame.borrowedAt && (
                                                <p className="text-xs text-red-600 mt-1">
                                                    Desde: {new Date(selectedGame.borrowedAt).toLocaleString('pt-BR').slice(0, 10)}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-red-600">Informações não disponíveis</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <h4 className="font-semibold mb-2">Informações do Jogo</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {selectedGame.publisher && (
                                        <>
                                            <span className="text-gray-600">Editora:</span>
                                            <span>{selectedGame.publisher}</span>
                                        </>
                                    )}
                                    {selectedGame.year_release && (
                                        <>
                                            <span className="text-gray-600">Lançamento:</span>
                                            <span>{selectedGame.year_release}</span>
                                        </>
                                    )}
                                    {selectedGame.players_min && selectedGame.players_max && (
                                        <>
                                            <span className="text-gray-600">Jogadores:</span>
                                            <span>{selectedGame.players_min} - {selectedGame.players_max}</span>
                                        </>
                                    )}
                                    {selectedGame.copies && (
                                        <>
                                            <span className="text-gray-600">Cópias:</span>
                                            <span>{selectedGame.copies}</span>
                                        </>
                                    )}

                                </div>
                            </div>

                            <div className="bg-green-50 border  border-green-200 rounded-lg p-4">
                                <h4 className="font-semibold mb-2">Quem sabe ensinar</h4>
                                {loadingTeachers ? (
                                    <p className="text-sm text-gray-600">Carregando...</p>
                                ) : teachers.length > 0 ? (
                                    <ul className="space-y-2">
                                        {teachers.map((teacher) => (
                                            <li key={teacher.id} className="flex items-center gap-2">
                                                {/*<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    {teacher.name?.charAt(0).toUpperCase()}
                                                </div>*/}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">👤 {teacher.name}</p>
                                                    {/*<p className="text-xs text-gray-600">{teacher.email}</p>*/}
                                                </div>
                                                {/*{teacher.role === 'admin' && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                                                        Admin
                                                    </span>
                                                )}
                                                {teacher.role === 'monitor' && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                                        Monitor
                                                    </span>
                                                )}*/}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-600">
                                        Ninguém marcou que sabe ensinar este jogo ainda.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}