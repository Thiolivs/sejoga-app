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
        <main className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-2 py-2">
            {activeTab === 'jogos' && (
                <div>
                    <BoardgameList />
                </div>
            )}

            {activeTab === 'profile' && (
                <div>
                    <MySeJogaSession />
                </div>
            )}

            {activeTab === 'register' && (
                <div>
                    <TeachingSessionLog />
                </div>
            )}

            {activeTab === 'training' && (
                <div>
                    <TrainingSession />
                </div>
            )}

            {activeTab === 'statistics' && (
                <div>
                    <StatisticsSession />
                </div>
            )}
        </main>
    );
}