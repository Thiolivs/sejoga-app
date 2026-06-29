'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTrainings } from '@/hooks/useTrainings';
import { useUser } from '@/hooks/useUser';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase';
import { Plus, Sun, Sunset, Moon, MapPin, Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';

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

const SHIFTS = {
    morning: { label: 'Manhã', icon: Sun, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    afternoon: { label: 'Tarde', icon: Sunset, color: 'bg-orange-100 text-orange-700 border-orange-300' },
    night: { label: 'Noite', icon: Moon, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
};

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

    const [availabilities, setAvailabilities] = useState<Record<string, TrainingAvailabilityWithProfile[]>>({});
    const [cycleUnavailabilities, setCycleUnavailabilities] = useState<Record<string, boolean>>({});
    const [unavailableUsers, setUnavailableUsers] = useState<Record<string, CycleUnavailabilityWithProfile[]>>({});
    const [expandedTrainings, setExpandedTrainings] = useState<Record<string, boolean>>({}); // ✅ NOVO

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
            const { error } = await supabase
                .from('trainings')
                .delete()
                .eq('id', trainingId);

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

    // ✅ NOVO: Conta monitores únicos
    const getUniqueMonitorsCount = (trainingId: string) => {
        const trainingAvail = availabilities[trainingId] || [];
        const uniqueUserIds = new Set(trainingAvail.map(a => a.user_id));
        return uniqueUserIds.size;
    };

    // ✅ NOVO: Toggle expansão
    const toggleExpand = (trainingId: string) => {
        setExpandedTrainings(prev => ({
            ...prev,
            [trainingId]: !prev[trainingId]
        }));
    };

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
                <div className="text-[35px] font-aladin text-center text-blue-800 flex-1 mb-5">Treinamentos</div>
                {isAdmin && (
                    <div className="flex gap-2">
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

            {/* Lista de ciclos */}
            {cycles.length === 0 ? (
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

                        return (
                            <div key={cycle.id} className="border border-gray-300 rounded-xl p-2 bg-gradient-to-br from-white to-gray-50">
                                {/* Cabeçalho do ciclo */}
                                <div className="mb-4">
                                    <h3 className="text-[20px] flex flex-col text-center font-bold text-gray-900 mb-2">{cycle.name}</h3>
                                </div>

                                {/* Checkbox de indisponibilidade total */}
                                {isMonitor && cycleTrainings.length > 0 && (
                                    <div className={`mb-1 p-3 rounded-lg`}>
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

                                            // ✅ Formata dia da semana separado
                                            const weekday = trainingDate.toLocaleDateString('pt-BR', { weekday: 'long' });
                                            const shortWeekday = weekday
                                                .replace("-feira", "")
                                                .replace(/^./, c => c.toUpperCase());
                                            // ✅ Formata dia e mês
                                            const dayMonth = trainingDate.toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: 'long'
                                            });

                                            const formattedDate = `${shortWeekday}, ${dayMonth.replace(' De ', ' de ')}`; // "Sexta, 23/Maio"

                                            const isExpanded = expandedTrainings[training.id];
                                            const monitorsCount = getUniqueMonitorsCount(training.id);

                                            return (
                                                <div key={training.id} className="bg-white border rounded-lg overflow-hidden">
                                                    {/* ✅ Header clicável */}
                                                    <div
                                                        className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                                                        onClick={() => toggleExpand(training.id)}
                                                    >
                                                        <div className="flex flex-col gap-1 flex-1">
                                                            <div className="flex items-center gap-2 text-gray-700 mr-2">
                                                                {/* <Calendar className="w-4 h-4" /> */}
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

                                                    {/* ✅ Conteúdo expansível */}
                                                    {isExpanded && (
                                                        <div className="border-t p-3 space-y-3">
                                                            {/* Botões de turno */}
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

                                                                                {/* ✅ Lista abaixo de cada turno */}
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

                                                            {/* ✅ Lista para quem não é monitor */}
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
            )}
        </div>
    );
}