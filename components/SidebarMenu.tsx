'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAndroidModern } from '@/hooks/useAndroidModern';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
    Menu,
    Dices,
    User,
    BarChart,
    Settings,
    Users,
    LogOut,
    Check
} from 'lucide-react';

interface SidebarMenuProps {
    isAdmin?: boolean;
    isMonitor?: boolean;
    currentPage?: string;
}

export function SidebarMenu({
    isAdmin = false,
    isMonitor = false,
    currentPage = 'user-app',
}: SidebarMenuProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const isAndroidModern = useAndroidModern();

    const handleNavigation = (path: string) => {
        router.push(path);
        setOpen(false);
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            setOpen(false);
            sessionStorage.removeItem('sejoga-session-active');
            localStorage.removeItem('userapp-active-tab');
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    // ✅ Ajusta posição do sidebar no Android 16
    useEffect(() => {
        if (open && isAndroidModern) {
            const timeoutId = setTimeout(() => {
                const sheet = document.querySelector('[role="dialog"].bg-background');
                if (sheet instanceof HTMLElement) {
                    sheet.style.setProperty('top', '40px', 'important');
                    sheet.style.setProperty('height', 'calc(100% - 40px)', 'important');
                }
            }, 50);

            return () => clearTimeout(timeoutId);
        }
    }, [open, isAndroidModern]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="h-5 h-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
                <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-2 mt-6">
                    <button
                        onClick={() => handleNavigation('/user-app')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            currentPage === 'user-app'
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                        <Dices className="w-5 h-5" />
                        <span className="font-medium">Acervo</span>
                    </button>

                    <button
                        onClick={() => handleNavigation('/user-app/profile')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            currentPage === 'perfil'
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Perfil</span>
                    </button>

                    {(isMonitor || isAdmin) && <div className="border-t my-2" />}

                    {(isMonitor || isAdmin) && (
                        <button
                            onClick={() => handleNavigation('/user-app/administration/event-selection')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                currentPage === 'event-selection'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            <Check className="w-5 h-5" />
                            <span className="font-medium">Seleção para Eventos</span>
                        </button>
                    )}

                    {(isMonitor || isAdmin) && (
                        <button
                            onClick={() => handleNavigation('/user-app/reports')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                currentPage === 'reports'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            <BarChart className="w-5 h-5" />
                            <span className="font-medium">Relatórios</span>
                        </button>
                    )}

                    {isAdmin && <div className="border-t my-2" />}

                    {isAdmin && (
                        <button
                            onClick={() => handleNavigation('/user-app/administration')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                currentPage === 'manage'
                                    ? 'bg-red-100 text-red-700'
                                    : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Gerenciar</span>
                        </button>
                    )}

                    {isAdmin && (
                        <button
                            onClick={() => handleNavigation('/user-app/administration/manage-users')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                currentPage === 'users'
                                    ? 'bg-red-100 text-red-700'
                                    : 'hover:bg-gray-100 text-gray-700'
                            }`}
                        >
                            <Users className="w-5 h-5" />
                            <span className="font-medium">Usuários</span>
                        </button>
                    )}

                    <div className="border-t my-2" />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-red-50 text-red-600"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sair</span>
                    </button>
                </nav>
            </SheetContent>
        </Sheet>
    );
}