import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { GameMechanic } from '@/types/database';

export function useGameMechanics() {
    const [mechanics, setMechanics] = useState<GameMechanic[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchMechanics();
    }, []);

    const fetchMechanics = async () => {
        try {
            const { data, error } = await supabase
                .from('game_mechanics')
                .select('*')
                .order('name');

            if (error) throw error;
            setMechanics(data || []);
        } catch (err) {
            console.error('Erro ao buscar mecânicas:', err);
        } finally {
            setLoading(false);
        }
    };

    const getMechanicsByType = (type: 'mechanic' | 'category' | 'mode') => {
        return mechanics.filter(m => m.type === type);
    };

    return {
        mechanics,
        loading,
        getMechanicsByType,
        allMechanics: mechanics.filter(m => m.type === 'mechanic'),
        categories: mechanics.filter(m => m.type === 'category'),
        modes: mechanics.filter(m => m.type === 'mode'),
    };
}