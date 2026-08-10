import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useUser } from './useUser';

type Role = 'admin' | 'monitor' | 'producao' | 'rpg' | 'publico';

export function useUserRole() {
    const { user, loading: userLoading } = useUser();
    const [role, setRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!user) {
            setRole(null);
            setLoading(false);
            return;
        }
        fetchUserRole();
    }, [user]);

    const fetchUserRole = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user!.id)
                .single();

            if (error) throw error;

            const fetchedRole = (data?.role || 'publico') as Role;
            setRole(fetchedRole);
        } catch (err) {
            console.error('Erro ao buscar role:', err instanceof Error ? err.message : 'Erro desconhecido');
            setRole('publico');
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = role === 'admin';
    // Monitor, produção e RPG têm o mesmo acesso; admin faz tudo que eles fazem
    const isMonitor =
        role === 'monitor' ||
        role === 'producao' ||
        role === 'rpg' ||
        role === 'admin';
    const isPublico = role === 'publico';

    return {
        role,
        loading: loading || userLoading,
        isAdmin,
        isMonitor,
        isPublico,
        canAddGames: isAdmin,
        canManageUsers: isAdmin,
        canTeachGames: isMonitor,
    };
}