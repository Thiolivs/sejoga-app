'use client';

import { useState } from 'react';
import { useBoardgames } from '@/hooks/useBoardgames';
import { useUser } from '@/hooks/useUser';
import { useUserRole } from '@/hooks/useUserRole'; // ← NOVO
import type { BoardgameWithTeachers, Profile } from '@/types/database';

export function BoardgameList() {
    const { user, loading: userLoading } = useUser();
    const { role, isAdmin, isMonitor, loading: roleLoading } = useUserRole(); // ← NOVO
    const { boardgames, loading, error, toggleTeach, getGameTeachers } = useBoardgames(user?.id);
    const [selectedGame, setSelectedGame] = useState<BoardgameWithTeachers | null>(null);
    const [teachers, setTeachers] = useState<Profile[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);

    const handleGameClick = async (game: BoardgameWithTeachers) => {
        setSelectedGame(game);
        setLoadingTeachers(true);
        const teachersList = await getGameTeachers(game.id);
        setTeachers(teachersList);
        setLoadingTeachers(false);
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
                    <p className="text-yellow-600 text-sm mt-2">
                        Parece que ainda não há jogos cadastrados no sistema.
                    </p>
                    {isAdmin && (
                        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Adicionar Primeiro Jogo
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4">
            {/* NOVO: Badge mostrando o role do usuário */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">
                        {boardgames.length} {boardgames.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}
                    </p>
                </div>

                {/* Badge de role */}
                {(isAdmin || isMonitor) && (
                    <div className="flex items-center gap-2">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${isAdmin
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                        >
                            {isAdmin ? '👑 Admin' : '🎓 Monitor'}
                        </span>
                    </div>
                )}
            </div>

            {/* NOVO: Botão para adicionar jogo (apenas admins) */}
            {isAdmin && (
                <div className="mb-4">
                    <button
                        onClick={() => {/* TODO: abrir modal de adicionar jogo */ }}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                        ➕ Adicionar Novo Jogo
                    </button>
                </div>
            )}

            {boardgames.map((game) => (
                <div
                    key={game.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                    <div className="flex items-center justify-between">
                        <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleGameClick(game)}
                        >
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{game.name}</h3>
                                {/* NOVO: Badge de número de cópias (apenas admins veem) */}
                                {isAdmin && game.copies > 0 && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                        {game.copies} {game.copies === 1 ? 'cópia' : 'cópias'}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap text-sm">
                                {game.publisher && (
                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                        {game.publisher}
                                    </span>
                                )}
                                {game.players_min && game.players_max && (
                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                        {game.players_min}-{game.players_max} jogadores
                                    </span>
                                )}
                                {game.coop && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                        Cooperativo
                                    </span>
                                )}
                                {game.comp && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                                        Competitivo
                                    </span>
                                )}
                                {game.kids && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                                        Infantil
                                    </span>
                                )}
                                {game.expansion && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                                        Expansão
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* NOVO: Checkbox apenas para monitores e admins */}
                        {isMonitor && (
                            <div className="flex items-center gap-2 ml-4">
                                <input
                                    type="checkbox"
                                    id={`teach-${game.id}`}
                                    checked={game.canTeach}
                                    onChange={() => toggleTeach(game.id, game.canTeach || false)}
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <label
                                    htmlFor={`teach-${game.id}`}
                                    className="text-sm cursor-pointer whitespace-nowrap"
                                >
                                    Sei ensinar
                                </label>
                            </div>
                        )}

                        {/* NOVO: Botões de ação para admins */}
                        {isAdmin && (
                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // TODO: editar jogo
                                    }}
                                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // TODO: deletar jogo
                                    }}
                                    className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded"
                                >
                                    🗑️ Deletar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Modal - continua igual */}
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
                                    {/* NOVO: Mostrar cópias apenas para admins */}
                                    {isAdmin && selectedGame.copies && (
                                        <>
                                            <span className="text-gray-600">Cópias disponíveis:</span>
                                            <span className="font-semibold text-green-700">{selectedGame.copies}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Quem sabe ensinar</h4>
                                {loadingTeachers ? (
                                    <p className="text-sm text-gray-600">Carregando...</p>
                                ) : teachers.length > 0 ? (
                                    <ul className="space-y-2">
                                        {teachers.map((teacher) => (
                                            <li key={teacher.id} className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    {teacher.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{teacher.name}</p>
                                                    <p className="text-xs text-gray-600">{teacher.email}</p>
                                                </div>
                                                {/* NOVO: Badge de role dos professores */}
                                                {teacher.role === 'admin' && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                                                        Admin
                                                    </span>
                                                )}
                                                {teacher.role === 'monitor' && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                                        Monitor
                                                    </span>
                                                )}
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