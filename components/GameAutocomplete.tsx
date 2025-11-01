'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Input } from '@/components/ui/input';

interface Game {
    id: string;
    name: string;
}

export function GameAutocomplete({
    value,
    onChange,
    required = false
}: {
    value: string;
    onChange: (gameId: string, gameName: string) => void;
    required?: boolean;
}) {
    const [search, setSearch] = useState('');
    const [games, setGames] = useState<Game[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedGame, setSelectedGame] = useState<string>('');
    const supabase = createClientComponentClient();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Buscar jogos quando o usuário digita
    useEffect(() => {
        const searchGames = async () => {
            if (search.length < 2) {
                setGames([]);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from('boardgames')
                .select('id, name')
                .ilike('name', `%${search}%`)
                .order('name')
                .limit(10);

            if (!error && data) {
                setGames(data);
                setShowDropdown(true);
            }
            setLoading(false);
        };

        const timeoutId = setTimeout(searchGames, 300); // debounce
        return () => clearTimeout(timeoutId);
    }, [search, supabase]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (game: Game) => {
        setSelectedGame(game.name);
        setSearch(game.name);
        onChange(game.id, game.name);
        setShowDropdown(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium mb-0.5">Jogo *</label>
            <Input
                type="text"
                value={search || selectedGame}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedGame('');
                    if (!e.target.value) {
                        onChange('', '');
                    }
                }}
                onFocus={() => search.length >= 2 && setShowDropdown(true)}
                placeholder="Digite para buscar um jogo..."
                required={required}
            />

            {/* Dropdown com resultados */}
            {showDropdown && games.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {games.map((game) => (
                        <button
                            key={game.id}
                            type="button"
                            onClick={() => handleSelect(game)}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors border-b last:border-b-0"
                        >
                            {game.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Mensagem de carregamento */}
            {loading && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-center text-sm text-gray-500">
                    Buscando jogos...
                </div>
            )}

            {/* Mensagem quando não encontra */}
            {showDropdown && !loading && search.length >= 2 && games.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-center text-sm text-gray-500">
                    Nenhum jogo encontrado
                </div>
            )}
        </div>
    );
}