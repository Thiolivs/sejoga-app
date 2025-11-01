'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Input } from '@/components/ui/input';

interface Publisher {
    id: string;
    name: string;
}

export function PublisherAutocomplete({
    value,
    onChange,
    required = false,
    reset = false
}: {
    value: string;
    onChange: (publisherId: string, publisherName: string) => void;
    required?: boolean;
    reset?: boolean;
}) {
    const [search, setSearch] = useState('');
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedPublisher, setSelectedPublisher] = useState<string>('');
    const supabase = createClientComponentClient();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Resetar quando o componente pai pedir
    useEffect(() => {
        if (reset) {
            setSearch('');
            setSelectedPublisher('');
            setPublishers([]);
            setShowDropdown(false);
        }
    }, [reset]);

    // Buscar editoras quando o usuário digita
    useEffect(() => {
        const searchPublishers = async () => {
            if (search.length < 2) {
                setPublishers([]);
                setShowDropdown(false);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from('publishers')
                .select('id, name')
                .ilike('name', `%${search}%`)
                .order('name')
                .limit(10);

            if (!error && data) {
                setPublishers(data);
                setShowDropdown(data.length > 0);
            }
            setLoading(false);
        };

        const timeoutId = setTimeout(searchPublishers, 300);
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

    const handleSelect = (publisher: Publisher) => {
        setSelectedPublisher(publisher.name);
        setSearch('');
        setPublishers([]);
        setShowDropdown(false);
        onChange(publisher.id, publisher.name);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium mb-0.5">
                Editora {required && '*'}
            </label>
            <Input
                type="text"
                value={selectedPublisher || search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedPublisher('');
                    if (!e.target.value) {
                        onChange('', '');
                    }
                }}
                onFocus={() => {
                    if (!selectedPublisher && search.length >= 2) {
                        setShowDropdown(true);
                    }
                }}
                placeholder="Digite para buscar uma editora..."
                required={required}
            />

            {/* Dropdown com resultados */}
            {showDropdown && publishers.length > 0 && !selectedPublisher && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {publishers.map((publisher) => (
                        <button
                            key={publisher.id}
                            type="button"
                            onClick={() => handleSelect(publisher)}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors border-b last:border-b-0"
                        >
                            {publisher.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Mensagem de carregamento */}
            {loading && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-center text-sm text-gray-500">
                    Buscando editoras...
                </div>
            )}

            {/* Mensagem quando não encontra */}
            {showDropdown && !loading && search.length >= 2 && publishers.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-center text-sm text-gray-500">
                    Nenhuma editora encontrada
                </div>
            )}
        </div>
    );
}