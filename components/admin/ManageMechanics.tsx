'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ArrowLeft, Tag } from 'lucide-react';
import type { GameMechanic } from '@/types/database';

export function ManageMechanics() {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [mechanics, setMechanics] = useState<GameMechanic[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'mechanic' | 'category' | 'mode'>('all');

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        type: 'mechanic' as 'mechanic' | 'category' | 'mode',
        icon: ''
    });

    useEffect(() => {
        fetchMechanics();
    }, []);

    const fetchMechanics = async () => {
        try {
            const { data, error } = await supabase
                .from('game_mechanics')
                .select('*')
                .order('type', { ascending: true })
                .order('name', { ascending: true });

            if (error) throw error;
            setMechanics(data || []);
        } catch (err) {
            console.error('Erro ao carregar mecânicas:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const slug = formData.slug || generateSlug(formData.name);

            if (editingId) {
                const { error } = await supabase
                    .from('game_mechanics')
                    .update({
                        name: formData.name,
                        slug: slug,
                        description: formData.description || null,
                        type: formData.type,
                        icon: formData.icon || null
                    })
                    .eq('id', editingId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('game_mechanics')
                    .insert([{
                        name: formData.name,
                        slug: slug,
                        description: formData.description || null,
                        type: formData.type,
                        icon: formData.icon || null
                    }]);

                if (error) throw error;
            }

            resetForm();
            await fetchMechanics();
        } catch (err) {
            console.error('Erro ao salvar mecânica:', err);
            alert('Erro ao salvar mecânica. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (mechanic: GameMechanic) => {
        setFormData({
            name: mechanic.name,
            slug: mechanic.slug,
            description: mechanic.description || '',
            type: mechanic.type,
            icon: mechanic.icon || ''
        });
        setEditingId(mechanic.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;

        try {
            const { error } = await supabase
                .from('game_mechanics')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchMechanics();
        } catch (err) {
            console.error('Erro ao deletar mecânica:', err);
            alert('Erro ao deletar mecânica.');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            type: 'mechanic',
            icon: ''
        });
        setEditingId(null);
        setShowAddForm(false);
    };

    const filteredMechanics = filterType === 'all'
        ? mechanics
        : mechanics.filter(m => m.type === filterType);


    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'mechanic': return 'text-green-700';
            case 'category': return 'text-blue-700';
            case 'mode': return 'text-purple-700';
            default: return 'text-gray-700';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'mechanic': return 'Mecânica';
            case 'category': return 'Categoria';
            case 'mode': return 'Modo';
            default: return type;
        }
    };

    if (loading && mechanics.length === 0) {
        return <div className="p-4 text-center">Carregando...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header com botão voltar */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>



            </div>
            <h1 className="text-2xl text-center font-bold text-blue-800 flex-1 mb-6">✨<i>Gerenciar Classificações</i>✨</h1>
            {!showAddForm && (
                <div className="flex justify-center items-center">

                    <Button onClick={() => setShowAddForm(true)} className="bg-sejoga-azul-oficial flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Cadastrar Nova Classificação
                    </Button>
                </div>
            )}
            {/* Filtros */}
            {!showAddForm && (
                <div className="border-1 rounded-lg p-1 inline-flex gap-2">
                    <Button
                        variant={filterType === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('all')}
                        className={`text-[12px] px-2 py-1 whitespace-nowrap ${filterType === 'all' ? 'bg-sejoga-verde-oficial' : ''}`}
                    >
                        Todas ({mechanics.length})
                    </Button>
                    <Button
                        variant={filterType === 'category' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('category')}
                        className={`text-[12px] px-2 py-1 whitespace-nowrap ${filterType === 'category' ? 'bg-sejoga-verde-oficial' : ''}`}
                    >
                        Categorias ({mechanics.filter(m => m.type === 'category').length})
                    </Button>
                    <Button
                        variant={filterType === 'mechanic' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('mechanic')}
                        className={`text-[12px] px-2 py-1  ${filterType === 'mechanic' ? 'bg-sejoga-verde-oficial' : ''}`}
                    >
                        Mecânicas ({mechanics.filter(m => m.type === 'mechanic').length})
                    </Button>
                    <Button
                        variant={filterType === 'mode' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterType('mode')}
                        className={`text-[12px] px-2 py-1 whitespace-nowrap ${filterType === 'mode' ? 'bg-sejoga-verde-oficial' : ''}`}
                    >
                        Modos ({mechanics.filter(m => m.type === 'mode').length})
                    </Button>
                </div>
            )}

            {/* Formulário */}
            {showAddForm && (
                <form onSubmit={handleSubmit} className="bg-white border-2 border-blue-200 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            {editingId ? 'Editar Classificação' : 'Nova Classificação'}
                        </h3>
                        <Button type="button" variant="ghost" size="icon" onClick={resetForm}>
                            ❌
                        </Button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome *
                        </label>
                        <Input
                            type="text"
                            placeholder="Ex: Construção de Baralho, Party Game"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (!editingId) {
                                    setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                                }
                            }}
                            required
                        />
                    </div>

                    {/*<div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Slug *
                        </label>
                        <Input
                            type="text"
                            placeholder="construcao-de-baralho"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Gerado automaticamente a partir do nome</p>
                    </div>*/}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo *
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="category">Categoria</option>
                            <option value="mechanic">Mecânica</option>
                            <option value="mode">Modo</option>
                        </select>
                    </div>

                    {/*<div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição
                        </label>
                        <textarea
                            placeholder="Descrição opcional da mecânica..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ícone (emoji)
                        </label>
                        <Input
                            type="text"
                            placeholder="🎲 🃏 ⚔️"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            maxLength={2}
                        />
                    </div>*/}

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-sejoga-verde-oficial flex-1">
                            {editingId ? 'Atualizar' : 'Criar'}
                        </Button>
                    </div>
                </form>
            )}

            {/* Lista de mecânicas */}
            <div className="space-y-3">
                {filteredMechanics.map((mechanic) => (
                    <div
                        key={mechanic.id}
                        className="bg-white border rounded-lg p-1.5"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    {mechanic.icon && <span className="text-xl flex-shrink-0">{mechanic.icon}</span>}
                                    <div className="flex items-center gap-1 flex-wrap">
                                        <h3 className="font-semibold text-sm p-1">{mechanic.name}</h3>
                                        <span className={`text-xs rounded whitespace-nowrap ${getTypeBadgeColor(mechanic.type)}`}>
                                            <span className="text-gray-400 mr-1.5">•</span>
                                            <i>{getTypeLabel(mechanic.type)}</i>
                                        </span>
                                    </div>
                                </div>
                                {mechanic.description && (
                                    <p className="text-sm text-gray-600">{mechanic.description}</p>
                                )}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                                <Button
                                    className='p-3'
                                    variant="outline"
                                    onClick={() => handleEdit(mechanic)}
                                >
                                    ✏️ Editar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDelete(mechanic.id, mechanic.name)}
                                    className="text-red-600 hover:bg-red-50"
                                >
                                    ❌
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredMechanics.length === 0 && !showAddForm && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                            {filterType === 'all' ? 'Nenhuma mecânica cadastrada ainda.' : `Nenhuma ${getTypeLabel(filterType).toLowerCase()} cadastrada ainda.`}
                        </p>
                        <Button onClick={() => setShowAddForm(true)} className="mx-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Criar Primeira Mecânica
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}