'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Calendar, Edit2, Trash2, Save, X, ArrowLeft } from 'lucide-react';
import type { TrainingCycle } from '@/types/database';

export function ManageTrainingCycles() {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [cycles, setCycles] = useState<TrainingCycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
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
                .order('start_date', { ascending: false });

            if (error) throw error;
            setCycles(data || []);
        } catch (err) {
            console.error('Erro ao carregar ciclos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                // Atualizar
                const { error } = await supabase
                    .from('training_cycles')
                    .update({
                        name: formData.name,
                        description: formData.description,
                        start_date: formData.start_date,
                        end_date: formData.end_date,
                        is_active: formData.is_active,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingId);

                if (error) throw error;
            } else {
                // Criar novo
                const { error } = await supabase
                    .from('training_cycles')
                    .insert([formData]);

                if (error) throw error;
            }

            resetForm();
            await fetchCycles();
        } catch (err) {
            console.error('Erro ao salvar ciclo:', err);
            alert('Erro ao salvar ciclo. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cycle: TrainingCycle) => {
        setFormData({
            name: cycle.name,
            description: cycle.description || '',
            start_date: cycle.start_date,
            end_date: cycle.end_date,
            is_active: cycle.is_active
        });
        setEditingId(cycle.id);
        setShowAddForm(true);
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
            start_date: '',
            end_date: '',
            is_active: true
        });
        setEditingId(null);
        setShowAddForm(false);
    };

    if (loading && cycles.length === 0) {
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
                <h2 className="text-2xl font-bold text-gray-900 flex-1">Ciclos de Treinamento</h2>
                {!showAddForm && (
                    <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Novo Ciclo
                    </Button>
                )}
            </div>

            {/* Formulário */}
            {showAddForm && (
                <form onSubmit={handleSubmit} className="bg-white border-2 border-blue-200 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            {editingId ? 'Editar Ciclo' : 'Novo Ciclo'}
                        </h3>
                        <Button type="button" variant="ghost" size="icon" onClick={resetForm}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Ciclo *
                        </label>
                        <Input
                            type="text"
                            placeholder="Ex: Treinamentos de Novembro"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data Início *
                            </label>
                            <Input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data Fim *
                            </label>
                            <Input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                required
                            />
                        </div>
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
                            Ciclo ativo (visível para os monitores)
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="flex-1">
                            <Save className="w-4 h-4 mr-2" />
                            {editingId ? 'Atualizar' : 'Criar Ciclo'}
                        </Button>
                    </div>
                </form>
            )}

            {/* Lista de ciclos */}
            <div className="space-y-3">
                {cycles.map((cycle) => (
                    <div
                        key={cycle.id}
                        className={`bg-white border rounded-lg p-4 ${
                            cycle.is_active ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-lg">{cycle.name}</h3>
                                    {!cycle.is_active && (
                                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                                            Inativo
                                        </span>
                                    )}
                                </div>
                                {cycle.description && (
                                    <p className="text-sm text-gray-600 mb-2">{cycle.description}</p>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        {new Date(cycle.start_date).toLocaleDateString('pt-BR')} - {' '}
                                        {new Date(cycle.end_date).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEdit(cycle)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleDelete(cycle.id)}
                                    className="text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {cycles.length === 0 && !showAddForm && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                            Nenhum ciclo cadastrado ainda.
                        </p>
                        <Button onClick={() => setShowAddForm(true)} className="mx-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Criar Primeiro Ciclo
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}