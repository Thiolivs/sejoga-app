'use client';

import { ClipboardList, Calendar, Dices, Star, ChartNoAxesCombined } from "lucide-react"

type Tab = 'training' | 'profile' | 'jogos' | 'register' | 'statistics';

interface UserAppTabsProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export function UserAppTabs({ activeTab, onTabChange }: UserAppTabsProps) {
    return (
        <div className="bg-white/70 shadow-sm backdrop-blur-sm">
            <div className="max-w2xl mx-auto flex flex-col items-center sm:px-6 lg:px-8">
                <nav className="flex" aria-label="Tabs">
                    <button
                        onClick={() => onTabChange('profile')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex flex-col items-center ${
                            activeTab === 'profile'
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Star className="w-4 h-4" />
                        Meu SeJoga
                    </button>

                    <button
                        onClick={() => onTabChange('register')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex flex-col items-center ${
                            activeTab === 'register'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <ClipboardList className="w-4 h-4" />
                        Registro
                    </button>

                    <button
                        onClick={() => onTabChange('jogos')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex flex-col items-center ${
                            activeTab === 'jogos'
                                ? 'border-sejoga-verde-oficial text-sejoga-verde-oficial'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Dices className="w-4 h-4" />
                        Acervo
                    </button>

                    <button
                        onClick={() => onTabChange('training')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex flex-col items-center ${
                            activeTab === 'training'
                                ? 'border-sejoga-azul-oficial text-sejoga-azul-oficial'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        Treinamentos
                    </button>

                    <button
                        onClick={() => onTabChange('statistics')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex flex-col items-center ${
                            activeTab === 'statistics'
                                ? 'border-sejoga-rosa-oficial text-sejoga-rosa-oficial'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <ChartNoAxesCombined className="w-4 h-4" />
                        Dados
                    </button>
                </nav>
            </div>
        </div>
    );
}