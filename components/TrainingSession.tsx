'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTrainings } from '@/hooks/useTrainings';
import { useUser } from '@/hooks/useUser';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plus, Sun, Sunset, Moon, MapPin, Calendar, XCircle, X } from 'lucide-react';

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

    const loadCycleData = useCallback(async (cycleId: string) => {
        if (!user) return;

        // Verifica se o usuário está indisponível para o ciclo
        const isUnavailable = await isUserUnavailableForCycle(cycleId, user.id);
        setCycleUnavailabilities(prev => ({ ...prev, [cycleId]: isUnavailable }));

        // Carrega lista de usuários indisponíveis
        const unavailable = await getCycleUnavailability(cycleId);
        setUnavailableUsers(prev => ({ ...prev, [cycleId]: unavailable }));

        // Carrega disponibilidades dos treinamentos
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
    }, [cycles.length]); // só depende do LENGTH, não do array inteiro

    const handleCycleUnavailability = async (cycleId: string, isCurrentlyUnavailable: boolean) => {
        if (!user) return;

        const result = await toggleCycleUnavailability(cycleId, user.id, !isCurrentlyUnavailable);

        if (result.success) {
            // Atualiza apenas este ciclo específico
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
            // Atualiza apenas este treinamento específico, sem recarregar tudo
            const data = await getTrainingAvailability(trainingId);
            setAvailabilities(prev => ({ ...prev, [trainingId]: data }));
        }
    };

    const handleDeleteTraining = async (trainingId: string, trainingDate: string) => {
        if (!confirm(`Tem certeza que deseja excluir o treinamento do dia ${trainingDate}?`)) return;

        try {
            const supabase = createClientComponentClient();
            const { error } = await supabase
                .from('trainings')
                .delete()
                .eq('id', trainingId);

            if (error) throw error;

            // Recarrega os dados do hook
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
        <div className="p-1 space-y-3">
            {/* Header */}
            <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Treinamentos</h2>
                {isAdmin && (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => router.push('/user-app/administration/manage-cycles')}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            Gerenciar Ciclos
                        </Button>
                        <Button
                            onClick={() => router.push('/user-app/administration/add-training')}
                            className="flex items-center gap-2 bg-sejoga-azul-oficial hover:bg-sejoga-azul-giz"
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
                        Nenhum ciclo de treinamento disponível
                    </h3>
                </div>
            ) : (
                <div className="space-y-8">
                    {cycles.map((cycle) => {
                        const cycleTrainings = getTrainingsByCycle(cycle.id);
                        const isUnavailable = cycleUnavailabilities[cycle.id];
                        const unavailableList = unavailableUsers[cycle.id] || [];

                        return (
                            <div key={cycle.id} className="border-1 border-gray-300 rounded-xl p-2 bg-gradient-to-br from-white to-gray-50">
                                {/* Cabeçalho do ciclo */}
                                <div className="mb-4">
                                    <h3 className="text-[20px] flex flex-col text-center font-bold text-gray-900 mb-2">{cycle.name}</h3>
                                </div>

                                {/* Checkbox de indisponibilidade total (só monitores e só se houver treinamentos) */}
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
                                    <div className="space-y-4">
                                        {cycleTrainings.map((training) => {
                                            const trainingDate = new Date(training.training_date);
                                            const formattedDate = trainingDate.toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: 'long',
                                                weekday: 'long'
                                            });

                                            return (
                                                <div key={training.id} className="bg-white border rounded-lg p-3">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                                <Calendar className="w-4 h-4" />
                                                                <span className="text-[14px] font-semibold capitalize">{formattedDate}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                                <MapPin className="w-3 h-3" />
                                                                <span>{training.location}</span>
                                                            </div>
                                                        </div>

                                                        {/* Botão deletar (só admin) */}
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => handleDeleteTraining(training.id, formattedDate)}
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                                                title="Excluir treinamento"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {isMonitor && (
                                                        <div className="flex gap-2 mb-3">
                                                            {Object.entries(SHIFTS).map(([shiftKey, shiftData]) => {
                                                                const ShiftIcon = shiftData.icon;
                                                                const isChecked = isUserAvailable(training.id, shiftKey);
                                                                const participants = (availabilities[training.id] || [])
                                                                    .filter((a: TrainingAvailabilityWithProfile) => a.shift === shiftKey);

                                                                return (
                                                                    <label
                                                                        key={shiftKey}
                                                                        className={`flex-1 flex items-center gap-2 p-2 rounded-lg border-1 cursor-pointer transition-all ${isChecked
                                                                            ? shiftData.color
                                                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                                            }`}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => handleToggle(training.id, shiftKey as 'morning' | 'afternoon' | 'night', isChecked)}
                                                                            className="w-5 h-5"
                                                                        />
                                                                        <div className="flex flex-col items-center gap-1 flex-1">
                                                                            <ShiftIcon className="w-4 h-4" />
                                                                            <span className="text-sm font-semibold">{shiftData.label}</span>
                                                                            {participants.length > 0 && (
                                                                                <span className="text-xs">({participants.length})</span>
                                                                            )}
                                                                        </div>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Mini tabela de participantes */}
                                                    {availabilities[training.id]?.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2">
                                                            {Object.entries(SHIFTS).map(([shiftKey, shiftData]) => {
                                                                const participants = (availabilities[training.id] || [])
                                                                    .filter((a: TrainingAvailabilityWithProfile) => a.shift === shiftKey)
                                                                    .map((a: TrainingAvailabilityWithProfile) => a.profiles?.first_name)
                                                                    .filter((name): name is string => Boolean(name));

                                                                return participants.length > 0 ? (
                                                                    <div key={shiftKey} className="text-xs">
                                                                        <div className="font-semibold text-gray-700 mb-1">{shiftData.label}:</div>
                                                                        <div className="text-gray-600 space-y-0.5">
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