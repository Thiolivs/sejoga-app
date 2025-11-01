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
    required = false,
    reset = false // ✅ novo prop para resetar
}: {
    value: string;
    onChange: (gameId: string, gameName: string) => void;
    required?: boolean;
    reset?: boolean; // ✅ adicionar
}) {
    const [search, setSearch] = useState('');
    const [games, setGames] = useState<Game[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedGame, setSelectedGame] = useState<string>('');
    const supabase = createClientComponentClient();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ✅ CORREÇÃO 2: Resetar quando o componente pai pedir
    useEffect(() => {
        if (reset) {
            setSearch('');
            setSelectedGame('');
            setGames([]);
            setShowDropdown(false);
        }
    }, [reset]);

    // Buscar jogos quando o usuário digita
    useEffect(() => {
        const searchGames = async () => {
            if (search.length < 2) {
                setGames([]);
                setShowDropdown(false); // ✅ fecha dropdown quando limpa
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
                setShowDropdown(data.length > 0); // ✅ só abre se tiver resultados
            }
            setLoading(false);
        };

        const timeoutId = setTimeout(searchGames, 300);
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

    // ✅ CORREÇÃO 1: Selecionar jogo na primeira vez
    const handleSelect = (game: Game) => {
        setSelectedGame(game.name);
        setSearch(''); // ✅ limpa a busca
        setGames([]); // ✅ limpa os resultados
        setShowDropdown(false); // ✅ fecha o dropdown
        onChange(game.id, game.name);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium mb-0.5">Jogo *</label>
            <Input
                type="text"
                value={selectedGame || search} // ✅ mostra o jogo selecionado ou a busca
                onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedGame(''); // ✅ limpa seleção ao digitar
                    if (!e.target.value) {
                        onChange('', '');
                    }
                }}
                onFocus={() => {
                    if (!selectedGame && search.length >= 2) {
                        setShowDropdown(true);
                    }
                }}
                placeholder="Digite para buscar um jogo..."
                required={required}
            />

            {/* Dropdown com resultados */}
            {showDropdown && games.length > 0 && !selectedGame && ( // ✅ não mostra se já selecionou
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