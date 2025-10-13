import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from './useUser';

export function useUserRole() {
    const { user, loading: userLoading } = useUser();
    const [role, setRole] = useState <'admin' | 'monitor' | 'user' | null > (null);
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();

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
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user!.id)
                .single();

            if (error) throw error;

            setRole(data?.role || 'user');
        } catch (err) {
            console.error('Erro ao buscar role:', err);
            setRole('user'); // Default if error
        } finally {
            setLoading(false);
        }
    };

    // Auxiliar Functions
    const isAdmin = role === 'admin';
    const isMonitor = role === 'monitor' || role === 'admin'; // Admin can do everything that monitor can do
    const isUser = role === 'user';

    return {
        role,
        loading: loading || userLoading,
        isAdmin,
        isMonitor,
        isUser,
        canAddGames: isAdmin, // Only admin can add boards
        canManageUsers: isAdmin, // Only admin can manage users
        canTeachGames: isMonitor, // Monitors and admins can check boards
    };
}