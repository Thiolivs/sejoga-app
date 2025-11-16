"use client";

import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserNav() {
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<string>('/avatars/MeepleColorido.png');
const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchUserAndProfile = async () => {
            console.log('🔍 UserNav - Iniciando busca...');

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            console.log('🔍 UserNav - User:', user);
            console.log('🔍 UserNav - Error:', userError);

            if (userError || !user) {
                console.log("Erro ao buscar usuário:", userError);
                return;
            }

            setUser(user);

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("first_name, role, avatar")
                .eq("id", user.id)
                .single();

            if (profileError) {
                console.log("Erro ao buscar perfil:", profileError);
            } else if (profile) {
                setName(profile.first_name);
                setRole(profile.role);
                setAvatar(profile.avatar || '/avatars/MeepleColorido.png');
            }
        };

        fetchUserAndProfile();

        // Configurar listener para mudanças em tempo real
        const setupRealtimeListener = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();

            if (!currentUser) return;

            const channel = supabase
                .channel('profile-changes')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${currentUser.id}`
                    },
                    (payload) => {
                        console.log('Perfil atualizado:', payload);
                        // Atualiza o estado com os novos dados
                        if (payload.new) {
                            setName(payload.new.first_name);
                            setRole(payload.new.role);
                            setAvatar(payload.new.avatar || '/avatars/MeepleColorido.png');
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupRealtimeListener();

    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <>
            {user && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-13 w-15 rounded-full">
                            <Avatar className="h-13 w-13">
                                <AvatarImage src={avatar} alt="User avatar" />
                                <AvatarFallback>
                                    {name ? name[0]?.toUpperCase() : '?'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">

                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-semibold leading-none">{name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                <p></p>
                                <p></p>
                                <span className="self-start bg-red-100 text-red-800 text-[11px] font-medium rounded px-1 py-0.5 leading-tight capitalize">
                                    {role}
                                </span>
                            </div>

                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={handleSignOut}>
                            Sair
                            <DropdownMenuShortcut></DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </>
    );
}