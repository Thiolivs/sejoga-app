'use client';

import { TeachingSessionLog } from '@/components/TeachingSessionLog';
import { MySeJogaSession } from '@/components/MySeJogaSession';
import { TrainingSession } from '@/components/TrainingSession';
import { StatisticsSession } from '@/components/StatisticsSession';
import { BoardgameList } from '@/components/BoardgameList';

type Tab = 'training' | 'profile' | 'jogos' | 'register' | 'statistics';

interface UserAppContentProps {
    activeTab: Tab;
}

export function UserAppContent({ activeTab }: UserAppContentProps) {
    return (
        <main style={{ 
            height: '100%',
            maxHeight: '100%',
            overflow: 'hidden',
            margin: 0,
            padding: 0
        }}>

        </main>
    );
}