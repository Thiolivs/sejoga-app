import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Training, TrainingCycle, TrainingCycleUnavailability } from '@/types/database';

export function useTrainings() {
    const [cycles, setCycles] = useState<TrainingCycle[]>([]);
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchData();

        // Realtime subscription
        const channel = supabase
            .channel('trainings-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'training_cycles' },
                () => fetchData()
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'trainings' },
                () => fetchData()
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'training_availability' },
                () => fetchData()
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'training_cycle_unavailability' },
                () => fetchData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Busca ciclos ativos
            const { data: cyclesData, error: cyclesError } = await supabase
                .from('training_cycles')
                .select('*')
                .eq('is_active', true)
                .order('start_date', { ascending: true });

            if (cyclesError) throw cyclesError;

            // Busca trainings ativos
            const { data: trainingsData, error: trainingsError } = await supabase
                .from('trainings')
                .select('*')
                .eq('is_active', true)
                .order('training_date', { ascending: true });

            if (trainingsError) throw trainingsError;

            setCycles(cyclesData || []);
            setTrainings(trainingsData || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTrainingsByCycle = (cycleId: string) => {
        return trainings.filter(t => t.cycle_id === cycleId);
    };

    const getTrainingAvailability = async (trainingId: string) => {
        try {
            const { data, error } = await supabase
                .from('training_availability')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        first_name,
                        last_name,
                        email,
                        role
                    )
                `)
                .eq('training_id', trainingId);

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Erro ao buscar disponibilidade:', err);
            return [];
        }
    };

    const getCycleUnavailability = async (cycleId: string) => {
        try {
            const { data, error } = await supabase
                .from('training_cycle_unavailability')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        first_name,
                        last_name,
                        email
                    )
                `)
                .eq('cycle_id', cycleId);

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Erro ao buscar indisponibilidade:', err);
            return [];
        }
    };

    const isUserUnavailableForCycle = async (cycleId: string, userId: string) => {
        try {
            const { data, error } = await supabase
                .from('training_cycle_unavailability')
                .select('id')
                .eq('cycle_id', cycleId)
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return !!data;
        } catch (err) {
            // Silenciosamente retorna false - não há problema se não encontrar
            return false;
        }
    };

    const toggleCycleUnavailability = async (
        cycleId: string,
        userId: string,
        isUnavailable: boolean,
        reason?: string
    ) => {
        try {
            if (isUnavailable) {
                // Marcar como indisponível
                const { error } = await supabase
                    .from('training_cycle_unavailability')
                    .insert({
                        cycle_id: cycleId,
                        user_id: userId,
                        reason: reason
                    });

                if (error) throw error;

                // Remove todas as disponibilidades específicas deste ciclo
                const cycleTrainings = getTrainingsByCycle(cycleId);
                for (const training of cycleTrainings) {
                    await supabase
                        .from('training_availability')
                        .delete()
                        .eq('training_id', training.id)
                        .eq('user_id', userId);
                }
            } else {
                // Remover indisponibilidade
                const { error } = await supabase
                    .from('training_cycle_unavailability')
                    .delete()
                    .eq('cycle_id', cycleId)
                    .eq('user_id', userId);

                if (error) throw error;
            }

            return { success: true };
        } catch (err) {
            console.error('Erro ao atualizar indisponibilidade do ciclo:', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao atualizar'
            };
        }
    };

    const toggleAvailability = async (
        trainingId: string,
        userId: string,
        shift: 'morning' | 'afternoon' | 'night',
        isChecked: boolean
    ) => {
        try {
            if (isChecked) {
                // Adicionar disponibilidade
                const { error } = await supabase
                    .from('training_availability')
                    .insert({
                        training_id: trainingId,
                        user_id: userId,
                        shift: shift
                    });

                if (error) throw error;
            } else {
                // Remover disponibilidade
                const { error } = await supabase
                    .from('training_availability')
                    .delete()
                    .eq('training_id', trainingId)
                    .eq('user_id', userId)
                    .eq('shift', shift);

                if (error) throw error;
            }

            return { success: true };
        } catch (err) {
            console.error('Erro ao atualizar disponibilidade:', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao atualizar'
            };
        }
    };

    return {
        cycles,
        trainings,
        loading,
        error,
        refetch: fetchData,
        getTrainingsByCycle,
        getTrainingAvailability,
        getCycleUnavailability,
        isUserUnavailableForCycle,
        toggleCycleUnavailability,
        toggleAvailability,
    };
}