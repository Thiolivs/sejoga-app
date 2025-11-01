'use client';

import { useState, useMemo } from 'react';
import { useBoardgames } from '@/hooks/useBoardgames';
import { useUser } from '@/hooks/useUser';
import { useUserRole } from '@/hooks/useUserRole';
import { useGameLoans } from '@/hooks/useGameLoans';
import { useGameMechanics } from '@/hooks/useGameMechanics';
import type { BoardgameWithTeachers, Profile } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function BoardgameList() {
    const { user, loading: userLoading } = useUser();
    const { isAdmin, isMonitor, loading: roleLoading } = useUserRole();
    const { boardgames, loading, error, toggleTeach, getGameTeachers, refetch } = useBoardgames(user?.id);
    const { borrowGame, returnGame, getLoanInfo, refetchLoans } = useGameLoans();
    const { mechanics, loading: mechanicsLoading } = useGameMechanics();

    const [selectedGame, setSelectedGame] = useState<BoardgameWithTeachers | null>(null);
    const [teachers, setTeachers] = useState<Profile[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [borrower, setBorrower] = useState<Profile | null>(null);
    const [loadingBorrower, setLoadingBorrower] = useState(false);

    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        minPlayers: null as number | null,
        maxPlayers: null as number | null,
        selectedMechanics: [] as string[], // IDs das mecânicas selecionadas
    });

    // Agrupar mecânicas por tipo
    const mechanicsByType = useMemo(() => {
        return {
            category: mechanics.filter(m => m.type === 'category'),
            mechanic: mechanics.filter(m => m.type === 'mechanic'),
            mode: mechanics.filter(m => m.type === 'mode'),
        };
    }, [mechanics]);

    // Filtrar jogos
    const filteredGames = useMemo(() => {
        return boardgames.filter((game) => {
            // Filtro de busca por nome
            if (searchTerm && !game.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Filtro por número de jogadores
            if (filters.minPlayers && game.players_min && filters.minPlayers < game.players_min) {
                return false;
            }
            if (filters.maxPlayers && game.players_max && filters.maxPlayers > game.players_max) {
                return false;
            }

            // Filtro por mecânicas selecionadas
            if (filters.selectedMechanics.length > 0) {
                // Verifica se o jogo tem TODAS as mecânicas selecionadas (AND)
                const hasAllMechanics = filters.selectedMechanics.every(selectedId =>
                    game.mechanics?.some(mechanic => mechanic.id === selectedId)
                );

                if (!hasAllMechanics) {
                    return false;
                }
            }

            return true;
        });
    }, [boardgames, searchTerm, filters]);

    // Verificar se há filtros ativos
    const hasActiveFilters =
        searchTerm !== '' ||
        filters.minPlayers !== null ||
        filters.maxPlayers !== null ||
        filters.selectedMechanics.length > 0;

    // Resetar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setFilters({
            minPlayers: null,
            maxPlayers: null,
            selectedMechanics: [],
        });
    };

    const toggleMechanic = (mechanicId: string) => {
        setFilters(prev => ({
            ...prev,
            selectedMechanics: prev.selectedMechanics.includes(mechanicId)
                ? prev.selectedMechanics.filter(id => id !== mechanicId)
                : [...prev.selectedMechanics, mechanicId]
        }));
    };

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
            await refetchLoans?.();
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
            await refetchLoans?.();
            await refetch();

            if (selectedGame?.id === boardgameId) {
                setBorrower(null);
            }
        }
    };

    if (userLoading || loading || roleLoading || mechanicsLoading) {
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
        <div className="space-y-2">
            {/* Barra de Busca e Filtros */}
            <div className="bg-white rounded-lg border-1 shadow-md p-2 mb-5">
                <div className="flex gap-3 items-center">
                    {/* Campo de busca */}
                    <div className=" bg-white flex-1 relative">
                        <Input
                            type="text"
                            placeholder="🔍 Buscar jogos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Botão de filtros */}
                    <Button
                        onClick={() => setShowFilters(!showFilters)}
                        variant={showFilters ? "default" : "outline"}
                        className={`whitespace-nowrap ${showFilters
                                ? 'bg-sejoga-vermelho-oficial hover:bg-red-600 text-white'
                                : hasActiveFilters
                                    ? 'border-blue-500 text-blue-600'
                                    : ''
                            }`}
                    >
                        {showFilters ? '▲' : '▼'} Filtros
                        {hasActiveFilters && !showFilters && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                                {(filters.minPlayers !== null ? 1 : 0) +
                                    (filters.maxPlayers !== null ? 1 : 0) +
                                    filters.selectedMechanics.length}
                            </span>
                        )}
                    </Button>
                    
                    {/* Botão limpar */}
                    {hasActiveFilters && (
                        <Button
                            onClick={clearFilters}
                            variant="ghost"
                            className="text-gray-600 hover:text-gray-800"
                        >
                            ❌ Limpar
                        </Button>
                    )}
                </div>

                {/* Painel de Filtros Avançados */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                        {/* Filtro por número de jogadores */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Jogadores:</p>
                            <div className="flex gap-4 items-center">
                                <div className="flex-1">
                                    <Input
                                        className="text-sm placeholder:text-xs"
                                        type="number"
                                        min="1"
                                        placeholder='Min:'
                                        value={filters.minPlayers || ''}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                minPlayers: e.target.value ? parseInt(e.target.value) : null,
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex-1">
                                    <Input
                                        className="text-sm placeholder:text-xs"
                                        type="number"
                                        min="1"
                                        placeholder='Max:'
                                        value={filters.maxPlayers || ''}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                maxPlayers: e.target.value ? parseInt(e.target.value) : null,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Categorias */}
                        {mechanicsByType.category.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Categorias:</p>
                                <div className="flex flex-wrap gap-2">
                                    {mechanicsByType.category.map((mechanic) => (
                                        <label
                                            key={mechanic.id}
                                            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all text-xs ${filters.selectedMechanics.includes(mechanic.id)
                                                ? 'bg-sejoga-azul-oficial text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={filters.selectedMechanics.includes(mechanic.id)}
                                                onChange={() => toggleMechanic(mechanic.id)}
                                            />
                                            {mechanic.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mecânicas */}
                        {mechanicsByType.mechanic.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Mecânicas:</p>
                                <div className="flex flex-wrap gap-2">
                                    {mechanicsByType.mechanic.map((mechanic) => (
                                        <label
                                            key={mechanic.id}
                                            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all text-xs ${filters.selectedMechanics.includes(mechanic.id)
                                                ? 'bg-sejoga-verde-oficial text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={filters.selectedMechanics.includes(mechanic.id)}
                                                onChange={() => toggleMechanic(mechanic.id)}
                                            />
                                            {mechanic.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Modos */}
                        {mechanicsByType.mode.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Modos:</p>
                                <div className="flex flex-wrap gap-2">
                                    {mechanicsByType.mode.map((mechanic) => (
                                        <label
                                            key={mechanic.id}
                                            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all text-xs ${filters.selectedMechanics.includes(mechanic.id)
                                                ? 'bg-sejoga-rosa-oficial text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={filters.selectedMechanics.includes(mechanic.id)}
                                                onChange={() => toggleMechanic(mechanic.id)}
                                            />
                                            {mechanic.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Contador de resultados */}
            <div className="flex justify-between items-center mb">
                <p className="text-sm text-gray-600">
                    {filteredGames.length === boardgames.length ? (
                        <>
                            <strong>{filteredGames.length}</strong>{' '}
                            {filteredGames.length === 1 ? 'jogo' : 'jogos'} no acervo
                        </>
                    ) : (
                        <>
                            Mostrando <strong>{filteredGames.length}</strong> de{' '}
                            <strong>{boardgames.length}</strong> jogos
                        </>
                    )}
                </p>

                {/*{(isAdmin || isMonitor) && (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${isAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}
                    >
                        {isAdmin ? 'Admin' : 'Monitor'}
                    </span>
                )}*/}
            </div>

            {/* Mensagem se não houver resultados */}
            {filteredGames.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">
                        🙁 Nenhum jogo encontrado
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                        ❌ Limpar filtros
                    </Button>
                </div>
            )}

            {/* Lista de jogos */}
            {filteredGames.map((game) => (
                <div
                    key={game.id}
                    className={`border rounded-lg transition-all ${game.isLoaned ? 'bg-red-50 border-red-300' : 'bg-white hover:shadow-md'
                        }`}
                >
                    <div className="flex gap-2">
                        {/* Conteúdo principal - esquerda */}
                        <div className="flex-1 p-3"> {/* ✅ reduzido de p-4 para p-3 */}
                            {/* LINHA 1 - Nome + Tag */}
                            <div
                                className="flex items-center justify-between gap-4 cursor-pointer"
                                onClick={() => handleGameClick(game)}
                            >
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold text-base">{game.name}</h3> {/* ✅ reduzido de text-lg para text-base */}

                                    {game.isLoaned && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded"> {/* ✅ reduzido py-1 para py-0.5 */}
                                            ⚔️ Emprestado
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* LINHA 2 - Checkbox */}
                            {isMonitor && (
                                <div className="flex items-center gap-2 text-left pt-1.5 border-t-2 border-gray-100 mt-1.5"> {/* ✅ reduzido pt-2/mt-2 para pt-1.5/mt-1.5 */}
                                    <input
                                        type="checkbox"
                                        id={`teach-${game.id}`}
                                        checked={game.canTeach}
                                        onChange={() => toggleTeach(game.id, game.canTeach || false)}
                                        className="custom-check"
                                    />
                                    <label
                                        htmlFor={`teach-${game.id}`}
                                        className="text-sm cursor-pointer select-none"
                                    >
                                        Sei ensinar
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Botão - direita (ocupa altura toda) */}
                        {isMonitor && (
                            <div className="flex items-center">
                                {game.isLoaned ? (
                                    game.loanedBy === user?.id ? (
                                        <button
                                            onClick={() => handleReturn(game.id)}
                                            className="w-20 py-4 bg-green-50 text-sejoga-verde-oficial border-l-2 border-sejoga-verde-oficial hover:bg-green-100 text-xs font-medium flex flex-col items-center justify-center gap-1 rounded-r-lg" /* ✅ reduzido de py-6 para py-4 */
                                        >
                                            <span className="text-base">⬅️</span> {/* ✅ reduzido de text-lg para text-base */}
                                            <span>Devolver</span>
                                        </button>
                                    ) : (
                                        <div className="w-20 py-4 bg-gray-100 text-gray-500 border-l-2 border-gray-300 text-xs font-medium cursor-not-allowed flex flex-col items-center justify-center gap-1 rounded-r-lg"> {/* ✅ reduzido de py-6 para py-4 */}
                                            <span className="text-lg">⚔️</span>
                                            <span className="text-center">Indisponível</span>
                                        </div>
                                    )
                                ) : (
                                    <button
                                        onClick={() => handleBorrow(game.id)}
                                        className="w-20 py-4 bg-blue-50 text-sejoga-azul-oficial border-l-2 border-sejoga-azul-oficial hover:bg-blue-100 text-xs font-medium flex flex-col items-center justify-center gap-1 rounded-r-lg" /* ✅ reduzido de py-6 para py-4 */
                                    >
                                        <span className="text-base">➡️</span> {/* ✅ reduzido de text-lg para text-base */}
                                        <span className="text-center leading-tight">Pegar<br />Emprestado</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            ))}

            {/* Modal - mantém sua formatação */}
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
                                                Para: 👤<strong>{borrower.first_name}</strong>
                                            </p>
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
                                <h4 className="font-semibold mb-2">Informações do Jogo:</h4>
                                <div className="grid grid-cols-2 text-sm">
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
                                <h4 className="font-semibold mb-2">Quem sabe ensinar:</h4>
                                {loadingTeachers ? (
                                    <p className="text-sm text-gray-600">Carregando...</p>
                                ) : teachers.length > 0 ? (
                                    <ul className="space-y-2">
                                        {teachers.map((teacher) => (
                                            <li key={teacher.id} className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">👤 {teacher.first_name}</p>
                                                </div>
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