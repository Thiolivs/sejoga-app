'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTrainings } from '@/hooks/useTrainings';
import { useUser } from '@/hooks/useUser';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Plus, Sun, Sunset, Moon, MapPin, Calendar } from 'lucide-react';
import type { TrainingAvailability, Profile } from '@/types/database';

const SHIFTS = {
    morning: { label: 'Manhã', icon: Sun, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    afternoon: { label: 'Tarde', icon: Sunset, color: 'bg-orange-100 text-orange-700 border-orange-300' },
    night: { label: 'Noite', icon: Moon, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
};

export function TrainingSession() {
    const router = useRouter();
    const { user } = useUser();
    const { isAdmin, isMonitor } = useUserRole();
    const { trainings, loading, toggleAvailability, getTrainingAvailability } = useTrainings();
    
    const [availabilities, setAvailabilities] = useState<Record<string, any[]>>({});
    const [loadingAvailabilities, setLoadingAvailabilities] = useState<Record<string, boolean>>({});

    useEffect(() => {
        trainings.forEach(training => {
            loadAvailability(training.id);
        });
    }, [trainings]);

    const loadAvailability = async (trainingId: string) => {
        setLoadingAvailabilities(prev => ({ ...prev, [trainingId]: true }));
        const data = await getTrainingAvailability(trainingId);
        setAvailabilities(prev => ({ ...prev, [trainingId]: data }));
        setLoadingAvailabilities(prev => ({ ...prev, [trainingId]: false }));
    };

    const handleToggle = async (
        trainingId: string,
        shift: 'morning' | 'afternoon' | 'night',
        isChecked: boolean
    ) => {
        if (!user) return;

        const result = await toggleAvailability(trainingId, user.id, shift, !isChecked);
        
        if (result.success) {
            // Recarrega disponibilidade
            await loadAvailability(trainingId);
        }
    };

    const isUserAvailable = (trainingId: string, shift: string) => {
        if (!user) return false;
        const trainingAvail = availabilities[trainingId] || [];
        return trainingAvail.some(
            (a: any) => a.user_id === user.id && a.shift === shift
        );
    };

    const getShiftParticipants = (trainingId: string, shift: string) => {
        const trainingAvail = availabilities[trainingId] || [];
        return trainingAvail
            .filter((a: any) => a.shift === shift)
            .map((a: any) => a.profiles?.first_name || 'Monitor')
            .filter(Boolean);
    };

    if (loading) {
        return (
            <div className="p-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
                <p className="text-center mt-4 text-gray-600">Carregando treinamentos...</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            {/* Header com botão de adicionar (só admin) */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Treinamentos</h2>
                {isAdmin && (
                    <Button
                        onClick={() => router.push('/user-app/administration/add-training')}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Treinamento
                    </Button>
                )}
            </div>

            {/* Lista de treinamentos */}
            {trainings.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <h3 className="text-yellow-800 font-semibold text-lg">
                        Nenhum treinamento disponível
                    </h3>
                    <p className="text-yellow-600 text-sm mt-2">
                        Aguarde novos treinamentos serem cadastrados.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {trainings.map((training) => {
                        const trainingDate = new Date(training.training_date);
                        const formattedDate = trainingDate.toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        });

                        return (
                            <div key={training.id} className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
                                {/* Cabeçalho do treinamento */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            <span className="font-semibold text-lg">{formattedDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{training.location}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Turnos - apenas para monitores */}
                                {isMonitor && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                        {Object.entries(SHIFTS).map(([shiftKey, shiftData]) => {
                                            const ShiftIcon = shiftData.icon;
                                            const isChecked = isUserAvailable(training.id, shiftKey);
                                            const participants = getShiftParticipants(training.id, shiftKey);

                                            return (
                                                <label
                                                    key={shiftKey}
                                                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                        isChecked
                                                            ? shiftData.color
                                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleToggle(training.id, shiftKey as any, isChecked)}
                                                        className="w-5 h-5 rounded"
                                                    />
                                                    <ShiftIcon className="w-5 h-5" />
                                                    <div className="flex-1">
                                                        <span className="font-semibold">{shiftData.label}</span>
                                                        {participants.length > 0 && (
                                                            <p className="text-xs mt-1">
                                                                {participants.length} confirmado(s)
                                                            </p>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Tabela de participantes */}
                                {loadingAvailabilities[training.id] ? (
                                    <p className="text-sm text-gray-500 text-center py-4">Carregando participantes...</p>
                                ) : availabilities[training.id]?.length > 0 ? (
                                    <div className="mt-4 border-t pt-4">
                                        <h4 className="font-semibold text-sm text-gray-700 mb-3">Monitores Confirmados:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {Object.entries(SHIFTS).map(([shiftKey, shiftData]) => {
                                                const participants = availabilities[training.id]
                                                    .filter((a: any) => a.shift === shiftKey)
                                                    .map((a: any) => a.profiles);

                                                return (
                                                    <div key={shiftKey} className="bg-gray-50 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {<shiftData.icon className="w-4 h-4 text-gray-600" />}
                                                            <span className="font-semibold text-sm">{shiftData.label}</span>
                                                        </div>
                                                        {participants.length > 0 ? (
                                                            <ul className="space-y-1">
                                                                {participants.map((p: any) => (
                                                                    <li key={p.id} className="text-sm text-gray-700">
                                                                        • {p.first_name} {p.last_name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-xs text-gray-500 italic">Nenhum confirmado</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        Nenhum monitor confirmado ainda
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