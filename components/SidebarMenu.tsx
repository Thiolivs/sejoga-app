'use client';

import { useState } from 'react';
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

// ✅ ADICIONE a interface
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
    // ... resto do código
}