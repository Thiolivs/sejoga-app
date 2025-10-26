"use client";

import { User, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
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
    const supabase = createClientComponentClient();
    const router = useRouter();

    // Busca o usuário autenticado e o nome no perfil
    useEffect(() => {
        const fetchUserAndProfile = async () => {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                console.log("Erro ao buscar usuário:", userError);
                return;
            }

            setUser(user);

            // Busca o nome do perfil na tabela "profiles"
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("first_name, role")
                .eq("id", user.id)
                .single();

            if (profileError) {
                console.log("Erro ao buscar perfil:", profileError);
            } else if (profile) {
                setName(profile.first_name)
                setRole(profile.role);
            }
        };

        fetchUserAndProfile();
    }, [supabase]); // roda apenas uma vez

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <>
            {user && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="/avatars/MeepleColorido.png" alt="User avatar" />
                                <AvatarFallback>
                                    {name ? name[0]?.toUpperCase() : name?.charAt(0)}
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
