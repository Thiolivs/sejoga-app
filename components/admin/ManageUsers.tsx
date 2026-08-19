'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { User, Shield, Crown, Wrench, Dices } from 'lucide-react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Role = 'publico' | 'monitor' | 'producao' | 'rpg' | 'admin';

interface UserProfile {
    id: string;
    first_name: string;
    last_name?: string;
    email: string;
    role: Role;
}

export function ManageUsers() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const supabase = createClient();

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);

            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email, role')
                .order('role');

            if (error) {
                console.error('Erro ao carregar usuários:', error);
                throw error;
            }

            setUsers(data || []);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
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

            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            alert('✅ Permissão atualizada com sucesso!');
            fetchUsers();
        } catch (error) {
            console.error('Erro ao atualizar permissão:', error);
            if (error && typeof error === 'object' && 'message' in error) {
                alert(`❌ Erro ao atualizar permissão: ${(error as { message: string }).message}`);
            } else {
                alert('❌ Erro ao atualizar permissão.');
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
            case 'producao':
                return <Wrench className="w-4 h-4" />;
            case 'rpg':
                return <Dices className="w-4 h-4" />;
            default:
                return <User className="w-4 h-4" />;
        }
    };

    const getRoleColor = (role: Role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'monitor':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'producao':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'rpg':
                return 'bg-green-100 text-green-800 border-green-300';
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
            case 'producao':
                return 'Produção';
            case 'rpg':
                return 'RPG';
            default:
                return 'Público';
        }
    };

    const getAvailableRoles = (currentRole: Role): Role[] => {
        const allRoles: Role[] = ['publico', 'monitor', 'producao', 'rpg', 'admin'];
        return allRoles.filter(role => role !== currentRole);
    };

    // Cor de hover para os botões de troca, por role de destino
    const getHoverClass = (role: Role) => {
        switch (role) {
            case 'admin':
                return 'hover:bg-red-50 hover:text-red-700 hover:border-red-300';
            case 'monitor':
                return 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300';
            case 'producao':
                return 'hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300';
            case 'rpg':
                return 'hover:bg-green-50 hover:text-green-700 hover:border-green-300';
            default:
                return 'hover:bg-gray-50';
        }
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
                <div className="grid grid-cols-5 gap-2 text-center">
                    <div>
                        <div className="text-lg font-bold text-red-800">
                            {users.filter((u) => u.role === 'admin').length}
                        </div>
                        <div className="text-[10px] text-gray-600">Admins</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-blue-800">
                            {users.filter((u) => u.role === 'monitor').length}
                        </div>
                        <div className="text-[10px] text-gray-600">Monitores</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-purple-800">
                            {users.filter((u) => u.role === 'producao').length}
                        </div>
                        <div className="text-[10px] text-gray-600">Produção</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-green-800">
                            {users.filter((u) => u.role === 'rpg').length}
                        </div>
                        <div className="text-[10px] text-gray-600">RPG</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-gray-800">
                            {users.filter((u) => u.role === 'publico').length}
                        </div>
                        <div className="text-[10px] text-gray-600">Público</div>
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
                            className={`bg-white border rounded-lg p-2.5 overflow-hidden ${isCurrentUser ? 'border-yellow-400 bg-yellow-50' : ''
                                }`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                {/* Info do usuário - esquerda */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span
                                            className={`px-1.5 py-0.5 rounded border text-[10px] font-medium flex-shrink-0 text-center justify-center ${getRoleColor(user.role)}`}
                                        >
                                            {getRoleLabel(user.role)}
                                        </span>

                                        <span className="text-[12px] truncate min-w-0">
                                            {user.first_name} {user.last_name}
                                        </span>

                                        {isCurrentUser && (
                                            <span className="px-1.5 py-0.5 bg-yellow-200 text-yellow-800 text-[10px] rounded flex-shrink-0">
                                                Você
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                                </div>

                                {/* Seletor de role - direita */}
                                <div className="flex items-center flex-shrink-0">
                                    {!isCurrentUser ? (
                                        <Select
                                            value={user.role}
                                            onValueChange={(newRole: Role) => {
                                                if (newRole === user.role) return;
                                                if (confirm(`Alterar ${user.first_name} para ${getRoleLabel(newRole)}?`)) {
                                                    updateUserRole(user.id, newRole);
                                                }
                                            }}
                                            disabled={isUpdating}
                                        >
                                            <SelectTrigger className="h-8 w-29 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(['publico', 'monitor', 'producao', 'rpg', 'admin'] as Role[]).map((r) => (
                                                    <SelectItem key={r} value={r} className="text-xs">
                                                        <span className="flex items-center gap-1.5">
                                                            {getRoleIcon(r)}
                                                            {getRoleLabel(r)}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="text-[10px] text-gray-500 italic max-w-[100px] text-right mr-2">
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