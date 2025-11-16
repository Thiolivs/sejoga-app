'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Event {
    id: string;
    name: string;
    event_date: string;
    is_active: boolean;
}

interface GameWithTeachers {
    id: string;
    name: string;
    publisher?: string;
    active: boolean;
    copies: number;
    teacherCount: number;
    isLoaned: boolean;
    selectedForEvent: boolean;
}

export function EventGameSelection() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [availableGames, setAvailableGames] = useState<GameWithTeachers[]>([]);
    const [unavailableGames, setUnavailableGames] = useState<GameWithTeachers[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetchGamesWithTeachers();
        }
    }, [selectedEventId]);

    const fetchEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('is_active', true)
                .order('event_date', { ascending: false });  // ← MUDOU

            if (error) throw error;

            setEvents(data || []);

            if (data && data.length > 0) {
                setSelectedEventId(data[0].id);
            }
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            alert('Erro ao carregar eventos');
        }
    };

    const fetchGamesWithTeachers = async () => {
        if (!selectedEventId) return;

        try {
            setLoading(true);

            // Buscar todos os jogos ativos
            const { data: games, error: gamesError } = await supabase
                .from('boardgames')
                .select('id, name, publisher, active, copies')
                .order('name');

            if (gamesError) throw gamesError;

            // Buscar contagem de professores por jogo
            const { data: teachCounts, error: teachError } = await supabase
                .from('user_teaches_game')
                .select('boardgame_id');

            if (teachError) throw teachError;

            // Contar professores por jogo
            const teacherCountMap = new Map<string, number>();
            teachCounts?.forEach(item => {
                const count = teacherCountMap.get(item.boardgame_id) || 0;
                teacherCountMap.set(item.boardgame_id, count + 1);
            });

            // Buscar jogos emprestados
            const { data: loans, error: loansError } = await supabase
                .from('game_loans')
                .select('boardgame_id')
                .is('returned_at', null);

            if (loansError) throw loansError;

            const loanedGameIds = new Set(loans?.map(l => l.boardgame_id) || []);

            // Buscar jogos selecionados para ESTE evento específico
            const { data: eventGames, error: eventError } = await supabase
                .from('event_game_selection')
                .select('boardgame_id')
                .eq('event_id', selectedEventId)
                .eq('selected', true);

            const selectedGameIds = new Set(eventGames?.map(e => e.boardgame_id) || []);

            // Processar jogos
            const available: GameWithTeachers[] = [];
            const unavailable: GameWithTeachers[] = [];

            games?.forEach(game => {
                const teacherCount = teacherCountMap.get(game.id) || 0;
                const isLoaned = loanedGameIds.has(game.id);

                const gameWithTeachers: GameWithTeachers = {
                    ...game,
                    teacherCount,
                    isLoaned,
                    selectedForEvent: selectedGameIds.has(game.id),
                };

                if (game.active && teacherCount >= 2) {
                    available.push(gameWithTeachers);
                } else {
                    unavailable.push(gameWithTeachers);
                }
            });

            setAvailableGames(available);
            setUnavailableGames(unavailable);
        } catch (error) {
            console.error('Erro ao carregar jogos:', error);
            alert('Erro ao carregar jogos');
        } finally {
            setLoading(false);
        }
    };

    const toggleGameSelection = async (gameId: string, currentState: boolean) => {
        if (!selectedEventId) {
            alert('Selecione um evento primeiro');
            return;
        }

        try {
            setSaving(true);

            if (currentState) {
                // Desmarcar
                const { error } = await supabase
                    .from('event_game_selection')
                    .delete()
                    .eq('boardgame_id', gameId)
                    .eq('event_id', selectedEventId);

                if (error) throw error;
            } else {
                // Marcar
                const { error } = await supabase
                    .from('event_game_selection')
                    .upsert({
                        boardgame_id: gameId,
                        event_id: selectedEventId,
                        selected: true,
                        selected_at: new Date().toISOString(),
                    });

                if (error) throw error;
            }

            // Atualizar estado local
            setAvailableGames(prev =>
                prev.map(game =>
                    game.id === gameId
                        ? { ...game, selectedForEvent: !currentState }
                        : game
                )
            );
        } catch (error) {
            console.error('Erro ao atualizar seleção:', error);
            alert('Erro ao atualizar seleção');
        } finally {
            setSaving(false);
        }
    };

    if (loading && events.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando eventos...</p>
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Nenhum evento ativo encontrado</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-white border rounded-lg p-3 pt-6">
            <div className="text-[35px] font-aladin text-center text-blue-800 flex-1 mb-5">
                Seleção para Eventos
            </div>

            {/* Seletor de Evento */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-blue-900 mb-2">
                    Selecione o Evento
                </label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Escolha um evento" />
                    </SelectTrigger>
                    <SelectContent>
                        {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                                {event.name} - {new Date(event.event_date).toLocaleDateString('pt-BR')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando jogos...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Header com estatísticas */}
                    <div className="bg-white mt-6 border-1 rounded-lg shadow p-3">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-sejoga-verde-oficial">
                                    {availableGames.length}
                                </p>
                                <p className="text-sm text-gray-600">Jogos Disponíveis</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-sejoga-azul-oficial">
                                    {availableGames.filter(g => g.selectedForEvent).length}
                                </p>
                                <p className="text-sm text-gray-600">Selecionados</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-sejoga-vermelho-oficial">
                                    {unavailableGames.length}
                                </p>
                                <p className="text-sm text-gray-600">Indisponíveis</p>
                            </div>
                        </div>
                    </div>

                    {/* Duas colunas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Coluna Esquerda: DISPONÍVEIS */}
                        <div className="bg-green-50 rounded-lg border-1 border-green-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl text-center font-bold text-green-800">
                                    ✅ Jogos Disponíveis
                                </h3>
                                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                                    {availableGames.length}
                                </span>
                            </div>
                            <p className="text-sm text-green-700 mb-4">
                                Jogos que 2 ou mais monitores sabem
                            </p>

                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {availableGames.length === 0 ? (
                                    <div className="text-center py-8 text-green-700">
                                        Nenhum jogo disponível ainda
                                    </div>
                                ) : (
                                    availableGames.map(game => (
                                        <div
                                            key={game.id}
                                            className={`bg-white rounded-lg p-4 border-1 transition-all ${game.selectedForEvent
                                                ? 'border-green-600 shadow-md'
                                                : 'border-green-100'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id={`game-${game.id}`}
                                                    checked={game.selectedForEvent}
                                                    onCheckedChange={() =>
                                                        toggleGameSelection(game.id, game.selectedForEvent)
                                                    }
                                                    disabled={saving}
                                                    className="mt-1"
                                                />
                                                <label
                                                    htmlFor={`game-${game.id}`}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">
                                                                {game.name}
                                                            </h4>
                                                            {game.publisher && (
                                                                <p className="text-xs text-gray-600">
                                                                    {game.publisher}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {game.isLoaned && (
                                                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                                                    ⚔️ Emprestado
                                                                </span>
                                                            )}
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-semibold">
                                                                👤{game.teacherCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Coluna Direita: INDISPONÍVEIS */}
                        <div className="bg-red-50 rounded-lg border-1 border-red-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl text-center font-bold text-red-800">
                                    ❌ Jogos Indisponíveis
                                </h3>
                                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                                    {unavailableGames.length}
                                </span>
                            </div>
                            <p className="text-sm text-red-700 mb-4">
                                Jogos inativos ou com menos de 2 monitores
                            </p>

                            <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                {unavailableGames.length === 0 ? (
                                    <div className="text-center py-8 text-red-700">
                                        Todos os jogos estão disponíveis! 🎉
                                    </div>
                                ) : (
                                    unavailableGames.map(game => (
                                        <div
                                            key={game.id}
                                            className="bg-white rounded-lg p-4 border-1 border-red-100 opacity-75"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    checked={false}
                                                    disabled={true}
                                                    className="mt-1 cursor-not-allowed"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-700">
                                                                {game.name}
                                                            </h4>
                                                            {game.publisher && (
                                                                <p className="text-xs text-gray-500">
                                                                    {game.publisher}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {!game.active && (
                                                                <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                                                    🚫 Inativo
                                                                </span>
                                                            )}
                                                            <span className={`px-2 py-1 text-xs rounded font-semibold ${game.teacherCount === 0
                                                                ? 'bg-red-200 text-red-900'
                                                                : 'bg-orange-100 text-orange-800'
                                                                }`}>
                                                                👤{game.teacherCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/*<p className="text-xs text-red-600 mt-2">
                                                        {!game.active
                                                            ? 'Jogo marcado como inativo'
                                                            : game.teacherCount === 0
                                                                ? 'Nenhum monitor sabe ensinar'
                                                                : 'Apenas 1 monitor sabe ensinar (mínimo: 2)'}
                                                    </p>*/}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}