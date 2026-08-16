'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTrainings } from '@/hooks/useTrainings';
import { useUser } from '@/hooks/useUser';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase';
import { Plus, Sun, Sunset, Moon, MapPin, Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
import { gerarOpcoes, MonitorAvailability, Shift, DistributionOption } from '@/lib/distribuicao';


interface TrainingAvailabilityWithProfile {
    id: string;
    training_id: string;
    user_id: string;
    shift: string;
    profiles?: {
        id: string;
        first_name: string;
        last_name: string;
    };
}

interface CycleUnavailabilityWithProfile {
    id: string;
    cycle_id: string;
    user_id: string;
    profiles?: {
        first_name: string;
        last_name: string;
    };
}

interface VotingMonitor {
    id: string;
    first_name: string;
    last_name: string;
}

const SHIFTS = {
    morning: { label: 'Manhã', icon: Sun, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    afternoon: { label: 'Tarde', icon: Sunset, color: 'bg-orange-100 text-orange-700 border-orange-300' },
    night: { label: 'Noite', icon: Moon, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
};

type SubTab = 'disponibilidade' | 'treinamentos' | 'jogos';

export function TrainingSession() {
    const router = useRouter();
    const { user } = useUser();
    const { isAdmin, isMonitor } = useUserRole();
    const {
        cycles,
        loading,
        getTrainingsByCycle,
        toggleAvailability,
        toggleCycleUnavailability,
        isUserUnavailableForCycle,
        getTrainingAvailability,
        getCycleUnavailability,
        refetch
    } = useTrainings();

    const [activeSubTab, setActiveSubTab] = useState<SubTab>('disponibilidade');

    const [availabilities, setAvailabilities] = useState<Record<string, TrainingAvailabilityWithProfile[]>>({});
    const availabilitiesRef = useRef<Record<string, TrainingAvailabilityWithProfile[]>>({});

    useEffect(() => {
        availabilitiesRef.current = availabilities;
    }, [availabilities]);

    const getTrainingAvailabilityRef = useRef(getTrainingAvailability);

    useEffect(() => {
        getTrainingAvailabilityRef.current = getTrainingAvailability;
    }, [getTrainingAvailability]);

    const [cycleUnavailabilities, setCycleUnavailabilities] = useState<Record<string, boolean>>({});
    const [unavailableUsers, setUnavailableUsers] = useState<Record<string, CycleUnavailabilityWithProfile[]>>({});
    const [expandedTrainings, setExpandedTrainings] = useState<Record<string, boolean>>({});

    // Lista de todos os monitores votantes (role exatamente 'monitor' ou 'admin')
    const [votingMonitors, setVotingMonitors] = useState<VotingMonitor[]>([]);

    useEffect(() => {
        const fetchVotingMonitors = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .in('role', ['monitor', 'admin']);

            if (!error && data) {
                setVotingMonitors(data);
            }
        };
        fetchVotingMonitors();
    }, []);

    // Aba Treinamentos (distribuição)
    const [opcoesPorCiclo, setOpcoesPorCiclo] = useState<Record<string, DistributionOption[]>>({});
    const [distribuicaoVisivel, setDistribuicaoVisivel] = useState<Record<string, { id: string; data: DistributionOption } | null>>({});
    const [salvandoVisivel, setSalvandoVisivel] = useState(false);

    // Monta as disponibilidades do ciclo no formato do algoritmo e gera as opções
    const gerarOpcoesDoCiclo = useCallback((cycleId: string): DistributionOption[] => {
        const cycleTrainings = getTrainingsByCycle(cycleId);

        // IDs dos monitores indisponíveis no ciclo (ficam de fora)
        const indisponiveis = new Set(
            (unavailableUsers[cycleId] || []).map(u => u.user_id)
        );

        // Agrupa por monitor: monitorId -> { name, availability: dateId -> Set<shift> }
        const porMonitor = new Map<string, MonitorAvailability>();

        cycleTrainings.forEach(training => {
            const avs = availabilities[training.id] || [];
            avs.forEach(a => {
                if (indisponiveis.has(a.user_id)) return; // pula indisponíveis
                let entry = porMonitor.get(a.user_id);
                if (!entry) {
                    entry = {
                        monitorId: a.user_id,
                        name: a.profiles?.first_name || 'Monitor',
                        availability: {},
                    };
                    porMonitor.set(a.user_id, entry);
                }
                if (!entry.availability[training.id]) {
                    entry.availability[training.id] = new Set<Shift>();
                }
                entry.availability[training.id].add(a.shift as Shift);
            });
        });

        const monitores = Array.from(porMonitor.values());
        const todasAsDatas = cycleTrainings.map(t => t.id);

        return gerarOpcoes(monitores, todasAsDatas, 5);
    }, [getTrainingsByCycle, availabilities, unavailableUsers]);

    // Busca a distribuição visível salva de um ciclo
    const carregarDistribuicaoVisivel = useCallback(async (cycleId: string) => {
        const supabase = createClient();
        const { data } = await supabase
            .from('training_distributions')
            .select('id, data')
            .eq('cycle_id', cycleId)
            .eq('is_visible', true)
            .maybeSingle();

        setDistribuicaoVisivel(prev => ({
            ...prev,
            [cycleId]: data ? { id: data.id, data: data.data as DistributionOption } : null,
        }));
    }, []);

    // Torna uma opção visível (salva no banco, substituindo a anterior do ciclo)
    const tornarVisivel = async (cycleId: string, opcao: DistributionOption) => {
        if (!confirm('Tornar esta opção visível para os monitores? Isso substitui a anterior.')) return;

        try {
            setSalvandoVisivel(true);
            const supabase = createClient();

            // Remove a visível anterior do ciclo (apaga, para não acumular)
            await supabase
                .from('training_distributions')
                .delete()
                .eq('cycle_id', cycleId);

            // Insere a nova como visível
            const { data, error } = await supabase
                .from('training_distributions')
                .insert({
                    cycle_id: cycleId,
                    is_visible: true,
                    data: opcao,
                })
                .select('id, data')
                .single();

            if (error) throw error;

            setDistribuicaoVisivel(prev => ({
                ...prev,
                [cycleId]: { id: data.id, data: data.data as DistributionOption },
            }));

            alert('✅ Opção definida como visível para os monitores!');
        } catch (err) {
            console.error('Erro ao tornar visível:', err);
            alert('Erro ao salvar. Tente novamente.');
        } finally {
            setSalvandoVisivel(false);
        }
    };

    useEffect(() => {
        if (activeSubTab !== 'treinamentos' || cycles.length === 0) return;

        cycles.forEach(cycle => {
            if (isAdmin) {
                const ops = gerarOpcoesDoCiclo(cycle.id);
                setOpcoesPorCiclo(prev => ({ ...prev, [cycle.id]: ops }));
            }
            carregarDistribuicaoVisivel(cycle.id);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSubTab, cycles.length, isAdmin]);

    const loadCycleData = useCallback(async (cycleId: string) => {
        if (!user) return;

        const isUnavailable = await isUserUnavailableForCycle(cycleId, user.id);
        setCycleUnavailabilities(prev => ({ ...prev, [cycleId]: isUnavailable }));

        const unavailable = await getCycleUnavailability(cycleId);
        setUnavailableUsers(prev => ({ ...prev, [cycleId]: unavailable }));

        const cycleTrainings = getTrainingsByCycle(cycleId);
        for (const training of cycleTrainings) {
            const data = await getTrainingAvailability(training.id);
            setAvailabilities(prev => ({ ...prev, [training.id]: data }));
        }
    }, [user, isUserUnavailableForCycle, getCycleUnavailability, getTrainingsByCycle, getTrainingAvailability]);

    useEffect(() => {
        if (cycles.length > 0) {
            cycles.forEach(cycle => {
                loadCycleData(cycle.id);
            });
        }
    }, [cycles.length]);

    // Realtime
    useEffect(() => {
        const supabase = createClient();
        let channel: ReturnType<typeof supabase.channel> | null = null;
        let cancelado = false;

        const iniciar = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session || cancelado) return;

            channel = supabase
                .channel('training_availability_realtime')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'training_availability' },
                    async (payload) => {
                        const novo = payload.new as { training_id?: string } | null;
                        const antigo = payload.old as { training_id?: string } | null;
                        const trainingId = novo?.training_id || antigo?.training_id;

                        const buscar = getTrainingAvailabilityRef.current;

                        if (trainingId) {
                            const atualizado = await buscar(trainingId);
                            setAvailabilities(prev => ({ ...prev, [trainingId]: atualizado }));
                        } else {
                            const ids = Object.keys(availabilitiesRef.current);
                            for (const tid of ids) {
                                const atualizado = await buscar(tid);
                                setAvailabilities(prev => ({ ...prev, [tid]: atualizado }));
                            }
                        }
                    }
                )
                .subscribe();
        };

        iniciar();

        return () => {
            cancelado = true;
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    const handleCycleUnavailability = async (cycleId: string, isCurrentlyUnavailable: boolean) => {
        if (!user) return;
        const result = await toggleCycleUnavailability(cycleId, user.id, !isCurrentlyUnavailable);
        if (result.success) {
            await loadCycleData(cycleId);
        }
    };

    const handleToggle = async (
        trainingId: string,
        shift: 'morning' | 'afternoon' | 'night',
        isChecked: boolean
    ) => {
        if (!user) return;
        const result = await toggleAvailability(trainingId, user.id, shift, !isChecked);
        if (result.success) {
            const data = await getTrainingAvailability(trainingId);
            setAvailabilities(prev => ({ ...prev, [trainingId]: data }));
        }
    };

    const handleDeleteTraining = async (trainingId: string, trainingDate: string) => {
        if (!confirm(`Tem certeza que deseja excluir o treinamento do dia ${trainingDate}?`)) return;
        try {
            const supabase = createClient();
            const { error } = await supabase.from('trainings').delete().eq('id', trainingId);
            if (error) throw error;
            await refetch();
        } catch (err) {
            console.error('Erro ao deletar treinamento:', err);
            alert('Erro ao deletar treinamento. Tente novamente.');
        }
    };

    const isUserAvailable = (trainingId: string, shift: string) => {
        if (!user) return false;
        const trainingAvail = availabilities[trainingId] || [];
        return trainingAvail.some(
            (a: TrainingAvailabilityWithProfile) => a.user_id === user.id && a.shift === shift
        );
    };

    const getUniqueMonitorsCount = (trainingId: string) => {
        const trainingAvail = availabilities[trainingId] || [];
        const uniqueUserIds = new Set(trainingAvail.map(a => a.user_id));
        return uniqueUserIds.size;
    };

    const toggleExpand = (trainingId: string) => {
        setExpandedTrainings(prev => ({ ...prev, [trainingId]: !prev[trainingId] }));
    };

    // Calcula quem ainda NAO votou naquele ciclo.
    // Votou = tem disponibilidade em algum treino do ciclo OU marcou indisponibilidade do ciclo.
    const getNonVoters = useCallback((cycleId: string): VotingMonitor[] => {
        const cycleTrainings = getTrainingsByCycle(cycleId);

        const votaram = new Set<string>();

        // Quem marcou disponibilidade em algum treino do ciclo
        cycleTrainings.forEach(t => {
            (availabilities[t.id] || []).forEach(a => votaram.add(a.user_id));
        });

        // Quem marcou indisponibilidade do ciclo
        (unavailableUsers[cycleId] || []).forEach(u => votaram.add(u.user_id));

        return votingMonitors.filter(m => !votaram.has(m.id));
    }, [getTrainingsByCycle, availabilities, unavailableUsers, votingMonitors]);

    if (loading) {
        return (
            <div className="p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
                <p className="text-center mt-4 text-gray-600">Carregando treinamentos...</p>
            </div>
        );
    }

    return (
        <div className="p-3 bg-white/90 rounded-lg space-y-3">
            {/* Header */}
            <div className="flex flex-col items-center">
                <div className="text-[35px] font-aladin text-center text-blue-800 flex-1 mb-3">Treinamentos</div>
                {isAdmin && (
                    <div className="flex gap-2 mb-3">
                        <Button
                            onClick={() => router.push('/user-app/administration/manage-cycles')}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            Gerenciar
                        </Button>
                        <Button
                            onClick={() => router.push('/user-app/administration/add-training')}
                            className="flex items-center gap-2 bg-sejoga-azul-oficial hover:bg-blue-500"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Treinamento
                        </Button>
                    </div>
                )}
            </div>

            {/* Sub-abas */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {([
                    ['disponibilidade', 'Disponibilidade'],
                    ['treinamentos', 'Treinamentos'],
                    ['jogos', 'Jogos'],
                ] as [SubTab, string][]).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setActiveSubTab(key)}
                        className={`flex-1 py-2 px-2 rounded-md text-sm font-semibold transition-colors ${activeSubTab === key
                            ? 'bg-white text-sejoga-azul-oficial shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ABA: DISPONIBILIDADE */}
            {activeSubTab === 'disponibilidade' && (
                cycles.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <h3 className="text-yellow-800 font-semibold text-lg">
                            Nenhum treinamento disponível
                        </h3>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {cycles.map((cycle) => {
                            const cycleTrainings = getTrainingsByCycle(cycle.id);
                            const isUnavailable = cycleUnavailabilities[cycle.id];
                            const unavailableList = unavailableUsers[cycle.id] || [];
                            const naoVotaram = getNonVoters(cycle.id);

                            return (
                                <div key={cycle.id} className="border border-gray-300 rounded-xl p-2 bg-gradient-to-br from-white to-gray-50">
                                    {/* Cabeçalho do ciclo */}
                                    <div className="mb-3">
                                        <h3 className="text-[20px] flex flex-col text-center font-bold text-gray-900 mb-2">{cycle.name}</h3>
                                    </div>

                                    {/* Lista horizontal de quem ainda nao votou */}
                                    {naoVotaram.length > 0 && (
                                        <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg p-2">
                                            <h4 className="font-semibold text-xs text-amber-800 mb-1">
                                                Ainda não responderam ({naoVotaram.length}):
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {naoVotaram.map(m => (
                                                    <span
                                                        key={m.id}
                                                        className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full"
                                                    >
                                                        {m.first_name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Checkbox de indisponibilidade total */}
                                    {isMonitor && cycleTrainings.length > 0 && (
                                        <div className="mb-1 p-3 rounded-lg">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isUnavailable || false}
                                                    onChange={() => handleCycleUnavailability(cycle.id, isUnavailable || false)}
                                                    className="w-5 h-5 rounded"
                                                />
                                                <div className="flex-1 text-xs">
                                                    Não tenho disponibilidade para essas datas
                                                </div>
                                            </label>
                                        </div>
                                    )}

                                    {/* Lista de indisponíveis */}
                                    {unavailableList.length > 0 && (
                                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3">
                                            <h4 className="font-semibold text-sm text-red-800">
                                                Monitores sem disponibilidade:
                                            </h4>
                                            <ul className="text-sm text-red-700 space-y-1">
                                                {unavailableList.map((u: CycleUnavailabilityWithProfile) => (
                                                    <li key={u.id}>
                                                        • {u.profiles?.first_name} {u.profiles?.last_name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Trainings do ciclo */}
                                    {!isUnavailable && cycleTrainings.length > 0 && (
                                        <div className="space-y-2">
                                            {cycleTrainings.map((training) => {
                                                const [year, month, day] = training.training_date.split('-');
                                                const trainingDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

                                                const weekday = trainingDate.toLocaleDateString('pt-BR', { weekday: 'long' });
                                                const shortWeekday = weekday
                                                    .replace("-feira", "")
                                                    .replace(/^./, c => c.toUpperCase());
                                                const dayMonth = trainingDate.toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'long'
                                                });

                                                const formattedDate = `${shortWeekday}, ${dayMonth.replace(' De ', ' de ')}`;

                                                const isExpanded = expandedTrainings[training.id];
                                                const monitorsCount = getUniqueMonitorsCount(training.id);

                                                return (
                                                    <div key={training.id} className="bg-white border rounded-lg overflow-hidden">
                                                        <div
                                                            className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                                                            onClick={() => toggleExpand(training.id)}
                                                        >
                                                            <div className="flex flex-col gap-1 flex-1">
                                                                <div className="flex items-center gap-2 text-gray-700 mr-2">
                                                                    {monitorsCount >= 0 && (
                                                                        <span className="px-2 py-0.5 bg-blue-200 text-gray-800 text-xs rounded">
                                                                            👤{monitorsCount}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-sm font-semibold">{formattedDate}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-gray-600">
                                                                    {isAdmin && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteTraining(training.id, formattedDate);
                                                                            }}
                                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                                                            title="Excluir treinamento"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                    <MapPin className="w-3 h-3" />
                                                                    <span className="text-xs">{training.location}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                {isExpanded ? (
                                                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                                                ) : (
                                                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="border-t p-3 space-y-3">
                                                                {/* Botões de turno (monitor) */}
                                                                {isMonitor && (
                                                                    <div className="flex gap-2">
                                                                        {Object.entries(SHIFTS).map(([shiftKey, shiftData]) => {
                                                                            const ShiftIcon = shiftData.icon;
                                                                            const isChecked = isUserAvailable(training.id, shiftKey);
                                                                            const participants = (availabilities[training.id] || [])
                                                                                .filter((a: TrainingAvailabilityWithProfile) => a.shift === shiftKey);

                                                                            return (
                                                                                <div key={shiftKey} className="flex-1">
                                                                                    <label
                                                                                        className={`flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${isChecked
                                                                                            ? shiftData.color
                                                                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                                                            }`}
                                                                                    >
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={isChecked}
                                                                                            onChange={() => handleToggle(training.id, shiftKey as 'morning' | 'afternoon' | 'night', isChecked)}
                                                                                            className="hidden"
                                                                                        />
                                                                                        <ShiftIcon className="w-4 h-4" />
                                                                                        <span className="text-sm font-semibold">{shiftData.label}</span>
                                                                                    </label>

                                                                                    {participants.length > 0 && (
                                                                                        <div className="mt-2 text-xs bg-gray-50 rounded p-2">
                                                                                            {participants.map((a: TrainingAvailabilityWithProfile, i: number) => (
                                                                                                <div key={i} className="text-gray-600">
                                                                                                    • {a.profiles?.first_name}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}

                                                                {/* Lista para quem não é monitor */}
                                                                {!isMonitor && availabilities[training.id]?.length > 0 && (
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        {Object.entries(SHIFTS).map(([shiftKey, shiftData]) => {
                                                                            const participants = (availabilities[training.id] || [])
                                                                                .filter((a: TrainingAvailabilityWithProfile) => a.shift === shiftKey)
                                                                                .map((a: TrainingAvailabilityWithProfile) => a.profiles?.first_name)
                                                                                .filter((name): name is string => Boolean(name));

                                                                            return participants.length > 0 ? (
                                                                                <div key={shiftKey}>
                                                                                    <div className="font-semibold text-xs text-gray-700 mb-1">
                                                                                        {shiftData.label}:
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-600 space-y-0.5">
                                                                                        {participants.map((name: string, i: number) => (
                                                                                            <div key={i}>• {name}</div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            ) : null;
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {cycleTrainings.length === 0 && (
                                        <p className="text-center text-gray-500 py-4">
                                            Nenhuma data cadastrada para este ciclo ainda
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            )}

            {/* ABA: TREINAMENTOS (opções de distribuição) */}
            {activeSubTab === 'treinamentos' && (
                cycles.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <h3 className="text-yellow-800 font-semibold text-lg">
                            Nenhum ciclo disponível
                        </h3>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {cycles.map((cycle) => {
                            const cycleTrainings = getTrainingsByCycle(cycle.id);
                            const opcoes = opcoesPorCiclo[cycle.id] || [];
                            const visivel = distribuicaoVisivel[cycle.id];

                            // Helper para achar a data formatada a partir do dateId
                            const nomeData = (dateId: string) => {
                                const t = cycleTrainings.find(ct => ct.id === dateId);
                                if (!t) return 'Data';
                                const [year, month, day] = t.training_date.split('-');
                                const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                const wd = d.toLocaleDateString('pt-BR', { weekday: 'long' })
                                    .replace('-feira', '').replace(/^./, c => c.toUpperCase());
                                const dm = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
                                return `${wd}, ${dm.replace(' De ', ' de ')}`;
                            };

                            const nomeTurno = (s: string) =>
                                s === 'morning' ? 'Manhã' : s === 'afternoon' ? 'Tarde' : 'Noite';

                            return (
                                <div key={cycle.id} className="border border-gray-300 rounded-xl p-3 bg-gradient-to-br from-white to-gray-50">
                                    <h3 className="text-[20px] text-center font-bold text-gray-900 mb-3">{cycle.name}</h3>

                                    {/* Admin: vê as opções geradas */}
                                    {isAdmin ? (
                                        opcoes.length === 0 ? (
                                            <p className="text-center text-gray-500 text-sm py-4">
                                                Aguardando disponibilidade dos monitores para gerar treinamentos.
                                            </p>
                                        ) : (
                                            <div className="space-y-4">
                                                {opcoes.map((opcao, idx) => {
                                                    // Verifica se esta opção é a que está visível (comparação simples por conteúdo)
                                                    const ehVisivel = visivel &&
                                                        JSON.stringify(visivel.data.trainings) === JSON.stringify(opcao.trainings);

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`border rounded-lg p-3 ${ehVisivel ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-semibold text-sm text-gray-800">
                                                                    Opção {idx + 1}
                                                                    {ehVisivel && <span className="ml-2 text-xs text-green-700">(visível)</span>}
                                                                </h4>
                                                                <button
                                                                    onClick={() => tornarVisivel(cycle.id, opcao)}
                                                                    disabled={salvandoVisivel || !!ehVisivel}
                                                                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${ehVisivel
                                                                        ? 'bg-green-200 text-green-800 cursor-default'
                                                                        : 'bg-sejoga-azul-oficial text-white hover:bg-blue-500'
                                                                        }`}
                                                                >
                                                                    {ehVisivel ? 'Visível' : 'Tornar visível'}
                                                                </button>
                                                            </div>

                                                            <div className="space-y-2">
                                                                {opcao.trainings.map((t, i) => (
                                                                    <div key={i} className="bg-gray-50 rounded p-2">
                                                                        <div className="font-semibold text-xs text-gray-700 mb-1">
                                                                            {nomeData(t.dateId)} · {t.monitorIds.length} monitores
                                                                        </div>
                                                                        <div className="grid grid-cols-3 gap-2">
                                                                            {Object.entries(t.shifts).map(([turno, nomes]) => (
                                                                                <div key={turno}>
                                                                                    <div className="text-[11px] font-semibold text-gray-600">{nomeTurno(turno)}:</div>
                                                                                    <div className="text-[11px] text-gray-600">
                                                                                        {(nomes as { id: string; name: string }[]).map((m, j) => (
                                                                                            <div key={j}>• {m.name}</div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {opcao.unassigned.length > 0 && (
                                                                <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
                                                                    <span className="text-xs text-red-700 font-semibold">Sem encaixe: </span>
                                                                    <span className="text-xs text-red-700">{opcao.unassigned.join(', ')}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )
                                    ) : (
                                        /* Monitor: vê a distribuição visível (parte 2B - por ora só um aviso) */
                                        visivel ? (
                                            <div className="space-y-2">
                                                {visivel.data.trainings.map((t, i) => (
                                                    <div key={i} className="bg-white border rounded-lg p-2">
                                                        <div className="font-semibold text-xs text-gray-700 mb-1">
                                                            {nomeData(t.dateId)}
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {Object.entries(t.shifts).map(([turno, nomes]) => (
                                                                <div key={turno}>
                                                                    <div className="text-[11px] font-semibold text-gray-600">{nomeTurno(turno)}:</div>
                                                                    <div className="text-[11px] text-gray-600">
                                                                        {(nomes as { id: string; name: string }[]).map((m, j) => (
                                                                            <div key={j}>• {m.name}</div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 text-sm py-4">
                                                As datas de treinamento ainda não foram definidas.
                                            </p>
                                        )
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            )}

            {/* ABA: JOGOS (parte 3) */}
            {activeSubTab === 'jogos' && (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Em breve: jogos a serem treinados.
                    </p>
                </div>
            )}
        </div>
    );
}