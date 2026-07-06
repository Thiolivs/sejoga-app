'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
    Star,
    ClipboardList,
    Calendar,
    Check,
    Settings,
    LogOut,
} from 'lucide-react';

type Tab = 'training' | 'profile' | 'jogos' | 'register' | 'statistics';

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
    const pathname = usePathname();
    const supabase = createClient();
    const isAndroidModern = useAndroidModern();

    const canSeeRestricted = isMonitor || isAdmin;

    // Troca de aba dentro do /user-app.
    // Se ja estamos na tela das tabs, dispara o evento (troca na hora).
    // Se estamos em outra pagina, navega para /user-app; o page.tsx le a aba do localStorage ao montar.
    const goToTab = (tab: Tab) => {
        localStorage.setItem('userapp-active-tab', tab);
        if (pathname === '/user-app') {
            window.dispatchEvent(new CustomEvent('sejoga-change-tab', { detail: tab }));
        } else {
            router.push('/user-app');
        }
        setOpen(false);
    };

    const handleNavigation = (path: string) => {
        router.push(path);
        setOpen(false);
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut({ scope: 'local' });
            setOpen(false);
            sessionStorage.removeItem('sejoga-session-active');
            localStorage.removeItem('userapp-active-tab');
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

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

    useEffect(() => {
        if (open) {
            const timeoutId = setTimeout(() => {
                document.body.style.pointerEvents = 'auto';
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            document.body.style.pointerEvents = 'auto';
        }
    }, [open]);

    const itemBase = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 text-gray-700";
    const itemAdmin = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-red-50 text-gray-700";

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="w-5 h-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 pt-10">
                <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-2 mt-6">
                    {/* Todos veem: Acervo e Meu SeJoga */}
                    <button onClick={() => goToTab('jogos')} className={itemBase}>
                        <Dices className="w-5 h-5" />
                        <span className="font-medium">Acervo</span>
                    </button>

                    <button onClick={() => goToTab('profile')} className={itemBase}>
                        <Star className="w-5 h-5" />
                        <span className="font-medium">Meu SeJoga</span>
                    </button>

                    {/* Monitores e admins: Registros e Treinamentos */}
                    {canSeeRestricted && <div className="border-t my-2" />}

                    {canSeeRestricted && (
                        <button onClick={() => goToTab('register')} className={itemBase}>
                            <ClipboardList className="w-5 h-5" />
                            <span className="font-medium">Registros</span>
                        </button>
                    )}

                    {canSeeRestricted && (
                        <button onClick={() => goToTab('training')} className={itemBase}>
                            <Calendar className="w-5 h-5" />
                            <span className="font-medium">Treinamentos</span>
                        </button>
                    )}

                    {/* Só admins: Seleção para Eventos e Gerenciar */}
                    {isAdmin && <div className="border-t my-2" />}

                    {isAdmin && (
                        <button
                            onClick={() => handleNavigation('/user-app/administration/event-selection')}
                            className={itemAdmin}
                        >
                            <Check className="w-5 h-5" />
                            <span className="font-medium">Seleção para Eventos</span>
                        </button>
                    )}

                    {isAdmin && (
                        <button
                            onClick={() => handleNavigation('/user-app/administration')}
                            className={itemAdmin}
                        >
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Gerenciar</span>
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