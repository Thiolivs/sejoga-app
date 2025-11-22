'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Checkbox } from '@/components/ui/checkbox';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
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
    returned?: boolean; // ✅ Estado local (não persiste no BD)
}

export function EventGameSelection() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [availableGames, setAvailableGames] = useState<GameWithTeachers[]>([]);
    const [selectedGames, setSelectedGames] = useState<GameWithTeachers[]>([]);
    const [unavailableGames, setUnavailableGames] = useState<GameWithTeachers[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // ✅ Estados de collapse
    const [availableCollapsed, setAvailableCollapsed] = useState(false);
    const [selectedCollapsed, setSelectedCollapsed] = useState(false);
    const [unavailableCollapsed, setUnavailableCollapsed] = useState(true);
    
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
                .order('event_date', { ascending: false });

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

            const { data: games, error: gamesError } = await supabase
                .from('boardgames')
                .select('id, name, publisher, active, copies')
                .order('name');

            if (gamesError) throw gamesError;

            const { data: teachCounts, error: teachError } = await supabase
                .from('user_teaches_game')
                .select('boardgame_id');

            if (teachError) throw teachError;

            const teacherCountMap = new Map<string, number>();
            teachCounts?.forEach(item => {
                const count = teacherCountMap.get(item.boardgame_id) || 0;
                teacherCountMap.set(item.boardgame_id, count + 1);
            });

            const { data: loans, error: loansError } = await supabase
                .from('game_loans')
                .select('boardgame_id')
                .is('returned_at', null);

            if (loansError) throw loansError;

            const loanedGameIds = new Set(loans?.map(l => l.boardgame_id) || []);

            const { data: eventGames, error: eventError } = await supabase
                .from('event_game_selection')
                .select('boardgame_id')
                .eq('event_id', selectedEventId)
                .eq('selected', true);

            const selectedGameIds = new Set(eventGames?.map(e => e.boardgame_id) || []);

            const available: GameWithTeachers[] = [];
            const selected: GameWithTeachers[] = [];
            const unavailable: GameWithTeachers[] = [];

            games?.forEach(game => {
                const teacherCount = teacherCountMap.get(game.id) || 0;
                const isLoaned = loanedGameIds.has(game.id);
                const isSelected = selectedGameIds.has(game.id);

                const gameWithTeachers: GameWithTeachers = {
                    ...game,
                    teacherCount,
                    isLoaned,
                    selectedForEvent: isSelected,
                    returned: false,
                };

                if (isSelected) {
                    selected.push(gameWithTeachers);
                } else if (game.active && teacherCount >= 2) {
                    available.push(gameWithTeachers);
                } else {
                    unavailable.push(gameWithTeachers);
                }
            });

            setAvailableGames(available);
            setSelectedGames(selected);
            setUnavailableGames(unavailable);
        } catch (error) {
            console.error('Erro ao carregar jogos:', error);
            alert('Erro ao carregar jogos');
        } finally {
            setLoading(false);
        }
    };

    const selectGame = async (game: GameWithTeachers) => {
        if (!selectedEventId) return;

        try {
            setSaving(true);

            const { error } = await supabase
                .from('event_game_selection')
                .upsert({
                    boardgame_id: game.id,
                    event_id: selectedEventId,
                    selected: true,
                    selected_at: new Date().toISOString(),
                });

            if (error) throw error;

            // Move para selecionados
            setAvailableGames(prev => prev.filter(g => g.id !== game.id));
            setSelectedGames(prev => [...prev, { ...game, selectedForEvent: true, returned: false }]);
        } catch (error) {
            console.error('Erro ao selecionar jogo:', error);
            alert('Erro ao selecionar jogo');
        } finally {
            setSaving(false);
        }
    };

    const unselectGame = async (game: GameWithTeachers) => {
        if (!selectedEventId) return;

        try {
            setSaving(true);

            const { error } = await supabase
                .from('event_game_selection')
                .delete()
                .eq('boardgame_id', game.id)
                .eq('event_id', selectedEventId);

            if (error) throw error;

            // Move de volta para disponíveis
            setSelectedGames(prev => prev.filter(g => g.id !== game.id));
            setAvailableGames(prev => [...prev, { ...game, selectedForEvent: false }].sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error('Erro ao desselecionar jogo:', error);
            alert('Erro ao desselecionar jogo');
        } finally {
            setSaving(false);
        }
    };

    const toggleReturned = (gameId: string) => {
        setSelectedGames(prev =>
            prev.map(game =>
                game.id === gameId
                    ? { ...game, returned: !game.returned }
                    : game
            )
        );
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
                    <div className="bg-white mt-6 border rounded-lg shadow p-3">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-sejoga-verde-oficial">
                                    {availableGames.length}
                                </p>
                                <p className="text-sm text-gray-600">Disponíveis</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-sejoga-azul-oficial">
                                    {selectedGames.length}
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

                    {/* Três colunas colapsáveis */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Coluna 1: DISPONÍVEIS */}
                        <div className="bg-green-50 rounded-lg border border-green-200">
                            <button
                                onClick={() => setAvailableCollapsed(!availableCollapsed)}
                                className="w-full p-4 flex items-center justify-between hover:bg-green-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    {availableCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    <h3 className="text-lg font-bold text-green-800">
                                        ✅ Disponíveis
                                    </h3>
                                </div>
                                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                                    {availableGames.length}
                                </span>
                            </button>

                            {!availableCollapsed && (
                                <div className="p-4 pt-0 space-y-2 max-h-[600px] overflow-y-auto">
                                    {availableGames.map(game => (
                                        <div
                                            key={game.id}
                                            onClick={() => selectGame(game)}
                                            className="bg-white rounded-lg p-3 border border-green-100 hover:border-green-400 hover:shadow-md transition-all cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 text-sm">
                                                        {game.name}
                                                    </h4>
                                                    {game.publisher && (
                                                        <p className="text-xs text-gray-600">
                                                            {game.publisher}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    {game.isLoaned && (
                                                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                                            ⚔️
                                                        </span>
                                                    )}
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-semibold">
                                                        👤{game.teacherCount}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {availableGames.length === 0 && (
                                        <p className="text-center text-sm text-green-700 py-4">
                                            Nenhum jogo disponível
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Coluna 2: SELECIONADOS */}
                        <div className="bg-blue-50 rounded-lg border border-blue-200">
                            <button
                                onClick={() => setSelectedCollapsed(!selectedCollapsed)}
                                className="w-full p-4 flex items-center justify-between hover:bg-blue-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    {selectedCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    <h3 className="text-lg font-bold text-blue-800">
                                        📦 Selecionados
                                    </h3>
                                </div>
                                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                                    {selectedGames.length}
                                </span>
                            </button>

                            {!selectedCollapsed && (
                                <div className="p-4 pt-0 space-y-2 max-h-[600px] overflow-y-auto">
                                    {selectedGames.map(game => (
                                        <div
                                            key={game.id}
                                            className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm"
                                        >
                                            <div className="flex items-start gap-2">
                                                <Checkbox
                                                    id={`returned-${game.id}`}
                                                    checked={game.returned}
                                                    onCheckedChange={() => toggleReturned(game.id)}
                                                    className="mt-1"
                                                />
                                                <label
                                                    htmlFor={`returned-${game.id}`}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <h4 className="font-semibold text-gray-900 text-sm">
                                                        {game.name}
                                                    </h4>
                                                    {game.publisher && (
                                                        <p className="text-xs text-gray-600">
                                                            {game.publisher}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        {game.returned ? '✓ Retornou' : 'Retornou'}
                                                    </p>
                                                </label>
                                                <button
                                                    onClick={() => unselectGame(game)}
                                                    disabled={saving}
                                                    className="p-1 hover:bg-red-100 rounded transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedGames.length === 0 && (
                                        <p className="text-center text-sm text-blue-700 py-4">
                                            Nenhum jogo selecionado
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Coluna 3: INDISPONÍVEIS */}
                        <div className="bg-red-50 rounded-lg border border-red-200">
                            <button
                                onClick={() => setUnavailableCollapsed(!unavailableCollapsed)}
                                className="w-full p-4 flex items-center justify-between hover:bg-red-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    {unavailableCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    <h3 className="text-lg font-bold text-red-800">
                                        ❌ Indisponíveis
                                    </h3>
                                </div>
                                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                                    {unavailableGames.length}
                                </span>
                            </button>

                            {!unavailableCollapsed && (
                                <div className="p-4 pt-0 space-y-2 max-h-[600px] overflow-y-auto">
                                    {unavailableGames.map(game => (
                                        <div
                                            key={game.id}
                                            className="bg-white rounded-lg p-3 border border-red-100 opacity-60"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-700 text-sm">
                                                        {game.name}
                                                    </h4>
                                                    {game.publisher && (
                                                        <p className="text-xs text-gray-500">
                                                            {game.publisher}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    {!game.active && (
                                                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                                            🚫
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-1 text-xs rounded font-semibold ${
                                                        game.teacherCount === 0
                                                            ? 'bg-red-200 text-red-900'
                                                            : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                        👤{game.teacherCount}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {unavailableGames.length === 0 && (
                                        <p className="text-center text-sm text-red-700 py-4">
                                            Todos disponíveis! 🎉
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}