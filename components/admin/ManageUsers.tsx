'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation'; // ✅ Adicionar
import { Button } from '@/components/ui/button';
import { User, Shield, Crown, ArrowLeft } from 'lucide-react'; // ✅ Adicionar ArrowLeft

interface UserProfile {
    id: string;
    first_name: string;
    last_name?: string;
    email: string;
    role: 'user' | 'monitor' | 'admin';
}

type Role = 'user' | 'monitor' | 'admin';

export function ManageUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter(); // ✅ Adicionar router

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);

            // Pegar ID do usuário atual
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);

            // Buscar todos os usuários
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email, role')
                .order('role');

            if (error) {
                console.error('❌ Erro detalhado:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            setUsers(data || []);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);

            // Mostrar erro mais detalhado
            if (error && typeof error === 'object' && 'message' in error) {
                alert(`❌ Erro ao carregar usuários: ${(error as { message: string }).message}`);
            } else {
                alert('❌ Erro ao carregar usuários. Verifique as permissões RLS no Supabase.');
            }
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const updateUserRole = async (userId: string, newRole: Role) => {
        try {
            setUpdatingUserId(userId);

            console.log('🔄 Tentando atualizar role:', { userId, newRole });

            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole }) // ✅ Removido updated_at
                .eq('id', userId);

            if (error) {
                console.error('❌ Erro detalhado:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                throw error;
            }

            alert('✅ Permissão atualizada com sucesso!');
            fetchUsers();
        } catch (error) {
            console.error('Erro ao atualizar permissão:', error);

            // Mostrar erro mais detalhado
            if (error && typeof error === 'object' && 'message' in error) {
                alert(`❌ Erro ao atualizar permissão: ${(error as { message: string }).message}`);
            } else {
                alert('❌ Erro ao atualizar permissão. Verifique as permissões RLS no Supabase.');
            }
        } finally {
            setUpdatingUserId(null);
        }
    };

    const getRoleIcon = (role: Role) => {
        switch (role) {
            case 'admin':
                return <Crown className="w-4 h-4" />;
            case 'monitor':
                return <Shield className="w-4 h-4" />;
            default:
                return <User className="w-4 h-4" />; // ✅ Voltando com o ícone
        }
    };

    const getRoleColor = (role: Role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'monitor':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getRoleLabel = (role: Role) => {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'monitor':
                return 'Monitor';
            default:
                return 'Usuário';
        }
    };

    const getAvailableRoles = (currentRole: Role): Role[] => {
        const allRoles: Role[] = ['user', 'monitor', 'admin'];
        return allRoles.filter(role => role !== currentRole);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
                <p className="text-center mt-4 text-gray-600">Carregando usuários...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 bg-white/95 rounded-lg p-4">

            <div className="text-[35px] font-aladin text-center text-blue-800 flex-1 mb-5">Gerenciar Usuários</div>

            {/* Estatísticas no topo */}
            <h3 className="font-semibold text-center text-sm mb-2">📊 Estatísticas:</h3>

            <div className="bg-white border rounded-lg p-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                        <div className="text-xl font-bold text-gray-800">
                            {users.filter((u) => u.role === 'user').length}
                        </div>
                        <div className="text-xs text-gray-600">Usuários</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-blue-800">
                            {users.filter((u) => u.role === 'monitor').length}
                        </div>
                        <div className="text-xs text-gray-600">Monitores</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-red-800">
                            {users.filter((u) => u.role === 'admin').length}
                        </div>
                        <div className="text-xs text-gray-600">Admins</div>
                    </div>
                </div>
            </div>

            {/* Contador total */}
            <div className="text-xs text-gray-600 text-center">
                Total: <strong>{users.length}</strong> usuários cadastrados
            </div>

            {/* Lista de usuários */}
            <div className="grid gap-2">
                {users.map((user) => {
                    const isCurrentUser = user.id === currentUserId;
                    const availableRoles = getAvailableRoles(user.role);
                    const isUpdating = updatingUserId === user.id;

                    return (
                        <div
                            key={user.id}
                            className={`bg-white border rounded-lg p-2.5 ${isCurrentUser ? 'border-yellow-400 bg-yellow-50' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                {/* Info do usuário - esquerda */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                        {/* Badge da role atual - SEM ícone */}
                                        <span
                                            className={`px-1.5 py-0.5 rounded border text-[10px] font-medium flex-shrink-0 text-center w-13 justify-center ${getRoleColor(
                                                user.role
                                            )}`}
                                        >
                                            {getRoleLabel(user.role)}
                                        </span>

                                        {/* Nome */}
                                        <h3 className="font-semibold text-sm truncate">
                                            {user.first_name} {user.last_name}
                                        </h3>

                                        {/* Tag "Você" */}
                                        {isCurrentUser && (
                                            <span className="px-1.5 py-0.5 bg-yellow-200 text-yellow-800 text-[10px] rounded flex-shrink-0">
                                                Você
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>

                                {/* Botões de alteração - direita */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {!isCurrentUser ? (
                                        <div className="flex flex-col gap-1">
                                            {availableRoles.map((newRole) => (
                                                <Button
                                                    key={newRole}
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                `Alterar ${user.first_name} para ${getRoleLabel(newRole)}?`
                                                            )
                                                        ) {
                                                            updateUserRole(user.id, newRole);
                                                        }
                                                    }}
                                                    disabled={isUpdating}
                                                    variant="outline"
                                                    size="sm"
                                                    className={`h-6 px-2 text-[10px] w-20 ${newRole === 'admin'
                                                        ? 'hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                                                        : newRole === 'monitor'
                                                            ? 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                                                            : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className="flex items-center gap-0.5">
                                                        {getRoleIcon(newRole)}
                                                        <span>→ {getRoleLabel(newRole)}</span>
                                                    </span>
                                                </Button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-gray-500 italic max-w-[80px] text-right">
                                            Não pode alterar
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
