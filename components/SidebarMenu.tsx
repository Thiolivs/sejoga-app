'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Dices, User, BarChart, Settings, Users, LogOut, Check } from 'lucide-react';
import { useAndroidModern } from '@/hooks/useAndroidModern';

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
    const isAndroidModern = useAndroidModern(); // Hook


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

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 pt-0">
                {/* ✅ Padding dinâmico baseado no hook */}
                <div
                    className="h-full flex flex-col"
                    style={{ borderTop: isAndroidModern ? '40px' : '0' }}
                >
                    <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>

                    <nav className="flex flex-col gap-2 mt-6 flex-1">
                        {/* Item: Acervo */}
                        <button
                            onClick={() => handleNavigation('/user-app')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'user-app'
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            <Dices className="w-5 h-5" />
                            <span className="font-medium">Acervo</span>
                        </button>

                        {/* Item: Perfil */}
                        <button
                            onClick={() => handleNavigation('/user-app/profile')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'perfil'
                                ? 'bg-blue-100 text-blue-700'
                                : 'hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            <User className="w-5 h-5" />
                            <span className="font-medium">Perfil</span>
                        </button>

                        {/* Separador (aparece apenas se for monitor ou admin) */}
                        {(isMonitor || isAdmin) && (
                            <div className="border-t my-2" />
                        )}

                        {/* Item: Eventos (apenas monitor/admin) */}
                        {(isMonitor || isAdmin) && (
                            <button
                                onClick={() => handleNavigation('/user-app/administration/event-selection')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'event-selection'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                <Check className="w-5 h-5" />
                                <span className="font-medium">Seleção para Eventos</span>
                            </button>
                        )}

                        {/* Item: Relatórios (apenas monitor/admin) */}
                        {(isMonitor || isAdmin) && (
                            <button
                                onClick={() => handleNavigation('/user-app/reports')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'reports'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                <BarChart className="w-5 h-5" />
                                <span className="font-medium">Relatórios</span>
                            </button>
                        )}

                        {/* Separador Admin */}
                        {isAdmin && (
                            <div className="border-t my-2" />
                        )}

                        {/* Item: Gerenciar (apenas admin) */}
                        {isAdmin && (
                            <button
                                onClick={() => handleNavigation('/user-app/administration')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'manage'
                                    ? 'bg-red-100 text-red-700'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                <Settings className="w-5 h-5" />
                                <span className="font-medium">Gerenciar</span>
                            </button>
                        )}

                        {/* Item: Usuários (apenas admin) */}
                        {isAdmin && (
                            <button
                                onClick={() => handleNavigation('/user-app/administration/manage-users')}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === 'users'
                                    ? 'bg-red-100 text-red-700'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                                <span className="font-medium">Usuários</span>
                            </button>
                        )}

                        {/* Logout no final */}
                        <div className="border-t my-2" />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-red-50 text-red-600"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sair</span>
                        </button>
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );
}