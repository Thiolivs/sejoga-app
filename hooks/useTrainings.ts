import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Training, TrainingAvailability, Profile } from '@/types/database';

export function useTrainings() {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchTrainings();

        // Realtime subscription
        const channel = supabase
            .channel('trainings-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'trainings' },
                () => fetchTrainings()
            )
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'training_availability' },
                () => fetchTrainings()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchTrainings = async () => {
        try {
            setLoading(true);

            const { data, error: fetchError } = await supabase
                .from('trainings')
                .select('*')
                .eq('is_active', true)
                .order('training_date', { ascending: true });

            if (fetchError) throw fetchError;

            setTrainings(data || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar treinamentos');
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
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
        trainings,
        loading,
        error,
        refetch: fetchTrainings,
        getTrainingAvailability,
        toggleAvailability,
    };
}