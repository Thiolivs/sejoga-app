'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Eye, EyeOff } from 'lucide-react';
import type { TrainingCycle } from '@/types/database';

export function ManageTrainingCycles() {
    const supabase = createClient();
    const [cycles, setCycles] = useState<TrainingCycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchCycles();
    }, []);

    const fetchCycles = async () => {
        try {
            const { data, error } = await supabase
                .from('training_cycles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCycles(data || []);
        } catch (err) {
            console.error('Erro ao carregar ciclos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('training_cycles')
                .update({
                    name: formData.name,
                    description: formData.description,
                    is_active: formData.is_active,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingId);

            if (error) throw error;

            resetForm();
            await fetchCycles();
        } catch (err) {
            console.error('Erro ao salvar ciclo:', err);
            alert('Erro ao salvar ciclo. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Toggle de visibilidade direto no card (sem abrir formulário)
    const toggleVisibility = async (cycle: TrainingCycle) => {
        try {
            const { error } = await supabase
                .from('training_cycles')
                .update({
                    is_active: !cycle.is_active,
                    updated_at: new Date().toISOString()
                })
                .eq('id', cycle.id);

            if (error) throw error;
            await fetchCycles();
        } catch (err) {
            console.error('Erro ao alterar visibilidade:', err);
            alert('Erro ao alterar visibilidade do ciclo.');
        }
    };

    const handleEdit = (cycle: TrainingCycle) => {
        setFormData({
            name: cycle.name,
            description: cycle.description || '',
            is_active: cycle.is_active
        });
        setEditingId(cycle.id);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza? Isso também excluirá todos os treinamentos deste ciclo.')) return;

        try {
            const { error } = await supabase
                .from('training_cycles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchCycles();
        } catch (err) {
            console.error('Erro ao deletar ciclo:', err);
            alert('Erro ao deletar ciclo.');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            is_active: true
        });
        setEditingId(null);
    };

    if (loading && cycles.length === 0) {
        return <div className="p-4 text-center">Carregando...</div>;
    }

    return (
        <div className="space-y-6">
            <div className='bg-white/95 p-3 rounded-lg'>
                <div className="text-[35px] font-aladin text-center text-blue-800 flex-1 mb-5">Ciclos de Treinamentos</div>

                {/* Formulário de edição (aparece só ao clicar em Editar) */}
                {editingId && (
                    <form onSubmit={handleUpdate} className="bg-white border-2 border-blue-200 mb-3 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Editar Ciclo</h3>
                            <Button type="button" variant="ghost" size="icon" onClick={resetForm}>
                                ❌
                            </Button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome do Ciclo *
                            </label>
                            <Input
                                type="text"
                                placeholder="Ex: Treinamentos de Maio"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_active_cycle"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-5 h-5 rounded"
                            />
                            <label htmlFor="is_active_cycle" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Ciclo visível para os monitores
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={loading} className="bg-sejoga-verde-oficial flex-1">
                                Atualizar
                            </Button>
                        </div>
                    </form>
                )}

                {/* Lista de ciclos */}
                <div className="space-y-3">
                    {cycles.map((cycle) => (
                        <div
                            key={cycle.id}
                            className={`bg-white border rounded-lg p-3 ${cycle.is_active ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-sm">{cycle.name}</h3>
                                        {!cycle.is_active && (
                                            <span className="px-2 mr-1 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                                                Oculto
                                            </span>
                                        )}
                                    </div>
                                    {cycle.description && (
                                        <p className="text-sm text-gray-600 mb-2">{cycle.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {/* ✅ Toggle de visibilidade */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => toggleVisibility(cycle)}
                                        className={cycle.is_active
                                            ? 'text-sejoga-verde-oficial hover:bg-green-50'
                                            : 'text-gray-400 hover:bg-gray-100'
                                        }
                                        title={cycle.is_active ? 'Visível para monitores' : 'Oculto para monitores'}
                                    >
                                        {cycle.is_active ? (
                                            <Eye className="w-4 h-4" />
                                        ) : (
                                            <EyeOff className="w-4 h-4" />
                                        )}
                                    </Button>

                                {/* Botão de editar
                                    <Button
                                        className='p-3'
                                        variant="outline"
                                        onClick={() => handleEdit(cycle)}
                                    >
                                        ✏️ Editar
                                    </Button>
                                 */}


                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleDelete(cycle.id)}
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        ❌
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {cycles.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">
                                Nenhum ciclo cadastrado ainda. Crie um pelo botão &quot;Novo Treinamento&quot;.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
