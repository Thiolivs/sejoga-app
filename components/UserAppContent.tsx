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
        <main className="max-w-7xl mx-auto" style={{ maxHeight: '100%', overflow: 'hidden' }}>
            {activeTab === 'jogos' && (
                <div>
                </div>
            )}
        </main>
    );
}