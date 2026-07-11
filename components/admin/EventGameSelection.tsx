'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, LogOut, LogIn, X, Copy, Check } from 'lucide-react';
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
    selectedForEvent: boolean; // "Selecionado" (Foi)
    returned: boolean;         // "Retornou" (Voltou)
}

interface TeacherProfile {
    id: string;
    first_name: string;
    last_name: string;
}

type PanelType = 'foram' | 'retornaram' | 'indisponiveis' | null;

export function EventGameSelection() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [games, setGames] = useState<GameWithTeachers[]>([]);
    const [unavailableGames, setUnavailableGames] = useState<GameWithTeachers[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loanModalGame, setLoanModalGame] = useState<GameWithTeachers | null>(null);
    const [loanBorrower, setLoanBorrower] = useState<{ name: string; since: string } | null>(null);
    const [loadingLoan, setLoadingLoan] = useState(false);

    const [collapsedPublishers, setCollapsedPublishers] = useState<Record<string, boolean>>({});

    // Painel aberto pelos contadores
    const [openPanel, setOpenPanel] = useState<PanelType>(null);
    const [copied, setCopied] = useState(false);

    // Modal de "quem sabe ensinar"
    const [teachersModalGame, setTeachersModalGame] = useState<GameWithTeachers | null>(null);
    const [teachersList, setTeachersList] = useState<TeacherProfile[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);

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

            const { data: gamesData, error: gamesError } = await supabase
                .from('boardgames')
                .select('id, name, publisher, active, copies')
                .order('publisher');

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
                .select('boardgame_id, user_id, borrowed_at')
                .is('returned_at', null);

            if (loansError) throw loansError;

            const loanedGameIds = new Set(loans?.map(l => l.boardgame_id) || []);

            const loanInfoMap = new Map<string, { user_id: string; borrowed_at: string }>();
            loans?.forEach(l => {
                loanInfoMap.set(l.boardgame_id, { user_id: l.user_id, borrowed_at: l.borrowed_at });
            });

            const { data: eventGames } = await supabase
                .from('event_game_selection')
                .select('boardgame_id, selected, returned')
                .eq('event_id', selectedEventId)
                .eq('selected', true);

            const selectionMap = new Map<string, boolean>();
            eventGames?.forEach(e => {
                selectionMap.set(e.boardgame_id, !!e.returned);
            });

            const available: GameWithTeachers[] = [];
            const unavailable: GameWithTeachers[] = [];

            gamesData?.forEach(game => {
                const teacherCount = teacherCountMap.get(game.id) || 0;
                const isLoaned = loanedGameIds.has(game.id);
                const isSelected = selectionMap.has(game.id);

                const gameEntry: GameWithTeachers = {
                    ...game,
                    teacherCount,
                    isLoaned,
                    selectedForEvent: isSelected,
                    returned: isSelected ? (selectionMap.get(game.id) || false) : false,
                };

                // Regra atual: ativo e teacherCount >= 0 (todos os ativos)
                if (game.active && teacherCount >= 0) {
                    available.push(gameEntry);
                } else {
                    unavailable.push(gameEntry);
                }
            });

            setGames(available);
            setUnavailableGames(unavailable);
        } catch (error) {
            console.error('Erro ao carregar jogos:', error);
            alert('Erro ao carregar jogos');
        } finally {
            setLoading(false);
        }
    };

    // "Selecionado" (Foi)
    const toggleFoi = async (game: GameWithTeachers) => {
        if (!selectedEventId) return;

        try {
            setSaving(true);
            const novoValor = !game.selectedForEvent;

            if (novoValor) {
                const { error } = await supabase
                    .from('event_game_selection')
                    .upsert({
                        boardgame_id: game.id,
                        event_id: selectedEventId,
                        selected: true,
                        selected_at: new Date().toISOString(),
                        returned: false,
                    }, { onConflict: 'boardgame_id,event_id' });
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('event_game_selection')
                    .delete()
                    .eq('boardgame_id', game.id)
                    .eq('event_id', selectedEventId);
                if (error) throw error;
            }

            setGames(prev =>
                prev.map(g =>
                    g.id === game.id
                        ? { ...g, selectedForEvent: novoValor, returned: novoValor ? g.returned : false }
                        : g
                )
            );
        } catch (error) {
            console.error('Erro ao marcar "Selecionado":', error);
            alert('Erro ao atualizar seleção');
        } finally {
            setSaving(false);
        }
    };

    // "Retornou" (Voltou)
    const toggleVoltou = async (game: GameWithTeachers) => {
        if (!selectedEventId) return;

        try {
            setSaving(true);
            const novoValor = !game.returned;

            const { error } = await supabase
                .from('event_game_selection')
                .update({ returned: novoValor })
                .eq('boardgame_id', game.id)
                .eq('event_id', selectedEventId);

            if (error) throw error;

            setGames(prev =>
                prev.map(g =>
                    g.id === game.id ? { ...g, returned: novoValor } : g
                )
            );
        } catch (error) {
            console.error('Erro ao marcar "Retornou":', error);
            alert('Erro ao atualizar retorno');
        } finally {
            setSaving(false);
        }
    };

    // Tornar um jogo indisponível em disponível (active = true)
    const tornarDisponivel = async (game: GameWithTeachers) => {
        if (!confirm(`Tornar "${game.name}" disponível?`)) return;

        try {
            setSaving(true);
            const { error } = await supabase
                .from('boardgames')
                .update({ active: true })
                .eq('id', game.id);

            if (error) throw error;

            // Remove dos indisponíveis e adiciona aos disponíveis
            setUnavailableGames(prev => prev.filter(g => g.id !== game.id));
            setGames(prev =>
                [...prev, { ...game, active: true }].sort((a, b) => a.name.localeCompare(b.name))
            );
        } catch (error) {
            console.error('Erro ao tornar disponível:', error);
            alert('Erro ao tornar o jogo disponível');
        } finally {
            setSaving(false);
        }
    };

    // Modal "quem sabe ensinar"
    const openTeachersModal = async (game: GameWithTeachers) => {
        setTeachersModalGame(game);
        setLoadingTeachers(true);
        setTeachersList([]);

        try {
            const { data: teachData, error: teachError } = await supabase
                .from('user_teaches_game')
                .select('user_id')
                .eq('boardgame_id', game.id);

            if (teachError) throw teachError;

            const userIds = teachData?.map(t => t.user_id) || [];
            if (userIds.length === 0) {
                setTeachersList([]);
                return;
            }

            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .in('id', userIds);

            if (profilesError) throw profilesError;
            setTeachersList(profiles || []);
        } catch (error) {
            console.error('Erro ao buscar monitores:', error);
            setTeachersList([]);
        } finally {
            setLoadingTeachers(false);
        }
    };

    const openLoanModal = async (game: GameWithTeachers) => {
        setLoanModalGame(game);
        setLoadingLoan(true);
        setLoanBorrower(null);

        try {
            const { data: loan } = await supabase
                .from('game_loans')
                .select('user_id, borrowed_at')
                .eq('boardgame_id', game.id)
                .is('returned_at', null)
                .maybeSingle();

            if (!loan) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name')
                .eq('id', loan.user_id)
                .single();

            setLoanBorrower({
                name: profile ? `${profile.first_name} ${profile.last_name}` : 'Desconhecido',
                since: loan.borrowed_at,
            });
        } catch (error) {
            console.error('Erro ao buscar empréstimo:', error);
        } finally {
            setLoadingLoan(false);
        }
    };

    const togglePublisher = (publisher: string) => {
        setCollapsedPublishers(prev => ({
            ...prev,
            [publisher]: !(prev[publisher] ?? true),
        }));
    };

    const handlePanelClick = (panel: PanelType) => {
        setOpenPanel(prev => (prev === panel ? null : panel));
        setCopied(false);
    };

    // Contadores
    const foramCount = useMemo(() => games.filter(g => g.selectedForEvent).length, [games]);
    const retornaramCount = useMemo(() => games.filter(g => g.returned).length, [games]);
    const disponiveisCount = games.length;
    const indisponiveisCount = unavailableGames.length;
    const todosVoltaram = foramCount > 0 && foramCount === retornaramCount;

    // Listas para os painéis (ordem alfabética)
    const listaForam = useMemo(
        () => games.filter(g => g.selectedForEvent).sort((a, b) => a.name.localeCompare(b.name)),
        [games]
    );
    const listaNaoRetornaram = useMemo(
        () => games.filter(g => g.selectedForEvent && !g.returned).sort((a, b) => a.name.localeCompare(b.name)),
        [games]
    );
    const listaIndisponiveis = useMemo(
        () => [...unavailableGames].sort((a, b) => a.name.localeCompare(b.name)),
        [unavailableGames]
    );

    const copiarLista = async () => {
        const texto = listaForam.map(g => g.name).join('\n');
        try {
            await navigator.clipboard.writeText(texto);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            alert('Não foi possível copiar. Copie manualmente.');
        }
    };

    // Filtra por busca e agrupa por editora
    const gamesByPublisher = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        const filtered = term
            ? games.filter(g => g.name.toLowerCase().includes(term))
            : games;

        const grupos: Record<string, GameWithTeachers[]> = {};
        filtered.forEach(game => {
            const pub = game.publisher || 'Sem editora';
            if (!grupos[pub]) grupos[pub] = [];
            grupos[pub].push(game);
        });

        return Object.keys(grupos)
            .sort((a, b) => a.localeCompare(b))
            .map(pub => ({
                publisher: pub,
                games: grupos[pub].sort((a, b) => a.name.localeCompare(b.name)),
            }));
    }, [games, searchTerm]);

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
        <div className="space-y-3 bg-white border rounded-lg p-3 pt-6">
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
                    {/* Quatro contadores */}
                    <div className="bg-white border rounded-lg shadow p-2">
                        <div className="grid grid-cols-3 gap-2">


                            {/* Foram - clicável */}
                            <button
                                onClick={() => handlePanelClick('foram')}
                                className={`text-center py-1 rounded-lg transition-colors ${openPanel === 'foram' ? 'bg-green-50 ring-2 ring-sejoga-verde-oficial' : 'hover:bg-gray-50'}`}
                            >
                                <p className="text-2xl font-bold text-sejoga-verde-oficial">
                                    {foramCount}
                                </p>
                                <p className="text-xs text-gray-600">Foram</p>
                            </button>

                            {/* Retornaram - clicável */}
                            <button
                                onClick={() => handlePanelClick('retornaram')}
                                className={`text-center py-1 rounded-lg transition-colors ${openPanel === 'retornaram' ? 'bg-orange-50 ring-2 ring-sejoga-laranja-oficial' : 'hover:bg-gray-50'}`}
                            >
                                <p className={"text-2xl font-bold text-sejoga-laranja-oficial"}>
                                    {retornaramCount}
                                </p>
                                <p className="text-xs text-gray-600">Retornaram</p>
                            </button>

                            {/* Disponíveis - não clicável *
                            <div className="text-center py-1">
                                <p className="text-2xl font-bold text-yellow-400">
                                    {disponiveisCount}
                                </p>
                                <p className="text-xs text-gray-600">Disponíveis</p>
                            </div>/}
                            */}

                            {/* Indisponíveis - clicável */}
                            <button
                                onClick={() => handlePanelClick('indisponiveis')}
                                className={`text-center py-1 rounded-lg transition-colors ${openPanel === 'indisponiveis' ? 'bg-red-50 ring-2 ring-sejoga-vermelho-oficial' : 'hover:bg-gray-50'}`}
                            >
                                <p className="text-2xl font-bold text-sejoga-vermelho-oficial">
                                    {indisponiveisCount}
                                </p>
                                <p className="text-xs text-gray-600">Indisponíveis</p>
                            </button>
                        </div>

                        {todosVoltaram && (
                            <p className="text-center text-sm text-sejoga-verde-oficial font-semibold mt-2">
                                🎉 Todos os jogos retornaram!
                            </p>
                        )}
                    </div>

                    {/* Painel dinâmico dos contadores */}
                    {openPanel && (
                        <div className="bg-white border rounded-lg shadow p-3 relative">
                            <button
                                onClick={() => setOpenPanel(null)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                                aria-label="Fechar"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* FORAM */}
                            {openPanel === 'foram' && (
                                <div>
                                    <div className="flex items-center justify-between mb-2 pr-6">
                                        <h4 className="font-semibold text-sm text-sejoga-verde-oficial">
                                            Jogos que foram ({listaForam.length})
                                        </h4>
                                        {listaForam.length > 0 && (
                                            <button
                                                onClick={copiarLista}
                                                className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                                            >
                                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                {copied ? 'Copiado!' : 'Copiar lista'}
                                            </button>
                                        )}
                                    </div>
                                    {listaForam.length > 0 ? (
                                        <ul className="text-sm text-gray-700 space-y-0.5 max-h-64 overflow-y-auto">
                                            {listaForam.map(g => (
                                                <li key={g.id}>{g.name}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Nenhum jogo selecionado ainda.</p>
                                    )}
                                </div>
                            )}

                            {/* RETORNARAM (mostra os que NÃO retornaram) */}
                            {openPanel === 'retornaram' && (
                                <div>
                                    <h4 className="font-semibold text-sm text-sejoga-laranja-oficial mb-2 pr-6">
                                        Ainda não retornaram ({listaNaoRetornaram.length})
                                    </h4>
                                    {listaNaoRetornaram.length > 0 ? (
                                        <ul className="text-sm text-gray-700 space-y-0.5 max-h-64 overflow-y-auto">
                                            {listaNaoRetornaram.map(g => (
                                                <li key={g.id}>{g.name}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-sejoga-verde-oficial font-medium">
                                            🎉 Todos os jogos que foram já retornaram!
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* INDISPONÍVEIS */}
                            {openPanel === 'indisponiveis' && (
                                <div>
                                    <h4 className="font-semibold text-sm text-sejoga-vermelho-oficial mb-2 pr-6">
                                        Jogos indisponíveis ({listaIndisponiveis.length})
                                    </h4>
                                    {listaIndisponiveis.length > 0 ? (
                                        <ul className="space-y-1 max-h-64 overflow-y-auto">
                                            {listaIndisponiveis.map(g => (
                                                <li key={g.id} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1">
                                                    <span className="text-sm text-gray-700 flex-1 min-w-0 break-words">{g.name}</span>
                                                    <button
                                                        onClick={() => tornarDisponivel(g)}
                                                        disabled={saving}
                                                        className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200 transition-colors flex-none"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                        Tornar disponível
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Nenhum jogo indisponível.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Campo de busca */}
                    <div className="relative">
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

                    {/* Lista de disponíveis, agrupada por editora */}
                    <div className="space-y-2">
                        {gamesByPublisher.length === 0 && (
                            <p className="text-center text-sm text-gray-500 py-6">
                                {searchTerm ? 'Nenhum jogo encontrado' : 'Nenhum jogo disponível'}
                            </p>
                        )}

                        {gamesByPublisher.map(({ publisher, games: pubGames }) => {
                            const isCollapsed = searchTerm.trim()
                                ? false
                                : (collapsedPublishers[publisher] ?? true);
                            const selecionadosNaEditora = pubGames.filter(g => g.selectedForEvent).length;
                            const temSelecionados = selecionadosNaEditora > 0;
                            return (
                                <div key={publisher} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => togglePublisher(publisher)}
                                        className={`w-full p-3 flex items-center justify-between transition-colors ${temSelecionados
                                            ? 'bg-blue-100 hover:bg-blue-200'
                                            : 'bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            <span className="font-semibold text-sm text-gray-800">{publisher}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${temSelecionados ? 'bg-blue-300 text-blue-900' : 'bg-gray-300 text-gray-700'
                                            }`}>
                                            {selecionadosNaEditora} / {pubGames.length}
                                        </span>
                                    </button>

                                    {!isCollapsed && (
                                        <div className="p-2 space-y-2">
                                            {pubGames.map(game => (
                                                <div
                                                    key={game.id}
                                                    className={`rounded-lg p-3 border ${game.selectedForEvent ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-gray-900 text-sm break-words">
                                                                {game.name}
                                                            </h4>

                                                            {/* Botões "Selecionado" e "Retornou" lado a lado */}
                                                            <div className="flex gap-1.5 mt-2">
                                                                <button
                                                                    onClick={() => toggleFoi(game)}
                                                                    disabled={saving}
                                                                    className={`flex items-center justify-center gap-1.5 px-1.5 py-1.5 rounded-lg border text-xs  transition-all ${game.selectedForEvent
                                                                        ? 'bg-sejoga-verde-oficial text-white border-sejoga-verde-oficial'
                                                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                                        }`}
                                                                >
                                                                    <LogOut className="w-3.5 h-3.5" />
                                                                    Vai pro evento
                                                                </button>

                                                                {game.selectedForEvent && (
                                                                    <button
                                                                        onClick={() => toggleVoltou(game)}
                                                                        disabled={saving}
                                                                        className={`flex items-center justify-center gap-1.5 px-1.5 py-1.5 rounded-lg border text-xs transition-all ${game.returned
                                                                            ? 'bg-sejoga-laranja-oficial text-white border-sejoga-laranja-oficial'
                                                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                                            }`}
                                                                    >
                                                                        <LogIn className="w-3.5 h-3.5" />
                                                                        Voltou
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Tag de monitores (clicável) */}
                                                        <div className="flex flex-col items-end gap-1 flex-none">

                                                            <button
                                                                onClick={() => openTeachersModal(game)}
                                                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-semibold hover:bg-green-200 transition-colors"
                                                                title="Ver quem sabe ensinar"
                                                            >
                                                                👤{game.teacherCount}
                                                            </button>
                                                            {game.isLoaned && (
                                                                <button
                                                                    onClick={() => openLoanModal(game)}
                                                                    className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded font-semibold hover:bg-orange-200 transition-colors"
                                                                    title="Ver com quem está"
                                                                >
                                                                    ⚔️ !
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Modal: quem sabe ensinar */}
            {teachersModalGame && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setTeachersModalGame(null)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold">{teachersModalGame.name}</h3>
                            <button
                                onClick={() => setTeachersModalGame(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 text-sm">Quem sabe ensinar:</h4>
                            {loadingTeachers ? (
                                <p className="text-sm text-gray-600">Carregando...</p>
                            ) : teachersList.length > 0 ? (
                                <ul className="space-y-1">
                                    {teachersList.map(teacher => (
                                        <li key={teacher.id} className="text-sm">
                                            👤 {teacher.first_name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-gray-600">
                                    Nenhum monitor informou que sabe ensinar este jogo.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {loanModalGame && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setLoanModalGame(null)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold">{loanModalGame.name}</h3>
                            <button
                                onClick={() => setLoanModalGame(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                            <h4 className="font-semibold text-orange-800 mb-2">⚔️ Jogo emprestado</h4>
                            {loadingLoan ? (
                                <p className="text-sm text-orange-600">Carregando...</p>
                            ) : loanBorrower ? (
                                <div>
                                    <p className="text-sm text-orange-700">
                                        Para: <strong>{loanBorrower.name}</strong>
                                    </p>
                                    <p className="text-sm text-orange-700 mt-1">
                                        Desde: <strong>{new Date(loanBorrower.since).toLocaleDateString('pt-BR')}</strong>
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-orange-600">Informações não disponíveis</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}