'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, MapPin, Save } from 'lucide-react';
import type { TrainingCycle } from '@/types/database';

export function AddTraining() {
    const router = useRouter();
    const supabase = createClientComponentClient();

    const [cycles, setCycles] = useState<TrainingCycle[]>([]);
    const [formData, setFormData] = useState({
        cycle_id: '',
        training_date: '',
        location: '',
        is_active: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchCycles();
    }, []);

    const fetchCycles = async () => {
        try {
            const { data, error } = await supabase
                .from('training_cycles')
                .select('*')
                .eq('is_active', true)
                .order('start_date', { ascending: true });

            if (error) throw error;
            setCycles(data || []);
        } catch (err) {
            console.error('Erro ao carregar ciclos:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Valida se a data está dentro do período do ciclo selecionado
            const selectedCycle = cycles.find(c => c.id === formData.cycle_id);
            if (selectedCycle) {
                const trainingDate = new Date(formData.training_date);
                const startDate = new Date(selectedCycle.start_date);
                const endDate = new Date(selectedCycle.end_date);

                if (trainingDate < startDate || trainingDate > endDate) {
                    setError(`A data do treinamento deve estar entre ${startDate.toLocaleDateString('pt-BR')} e ${endDate.toLocaleDateString('pt-BR')}`);
                    setLoading(false);
                    return;
                }
            }

            const { error: insertError } = await supabase
                .from('trainings')
                .insert([{
                    cycle_id: formData.cycle_id,
                    training_date: formData.training_date,
                    location: formData.location,
                    is_active: formData.is_active
                }]);

            if (insertError) throw insertError;

            setSuccess(true);

            // Limpa o formulário
            setFormData({
                cycle_id: '',
                training_date: '',
                location: '',
                is_active: true
            });

            // Redireciona após 2 segundos
            setTimeout(() => {
                router.back();
            }, 2000);

        } catch (err) {
            console.error('Erro ao criar treinamento:', err);
            setError(err instanceof Error ? err.message : 'Erro ao criar treinamento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </div>

            {/* Aviso se não houver ciclos */}
            {cycles.length === 0 && !loading && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 text-center">
                    <p className="text-sm text-yellow-800 mb-3">
                        ⚠️ Nenhum ciclo ativo encontrado.
                    </p>
                    <Button
                        onClick={() => router.push('/user-app/administration/manage-cycles')}
                        variant="outline"
                        className="border-yellow-400 hover:bg-yellow-100"
                    >
                        Ir para Gerenciar Ciclos
                    </Button>
                </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                <div className="text-[35px] font-aladin text-center text-blue-800 flex-1 mb-5">Novo Treinamento</div>

                {/* Seleção de Ciclo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciclo de Treinamento *
                    </label>
                    <select
                        value={formData.cycle_id}
                        onChange={(e) => setFormData({ ...formData, cycle_id: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="">Selecione um ciclo</option>
                        {cycles.map((cycle) => (
                            <option key={cycle.id} value={cycle.id}>
                                {cycle.name} ({new Date(cycle.start_date).toLocaleDateString('pt-BR')} - {new Date(cycle.end_date).toLocaleDateString('pt-BR')})
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Se não houver ciclos, crie um primeiro em Gerenciar Ciclos
                    </p>
                </div>

                {/* Data do Treinamento */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Data do Treinamento *
                    </label>
                    <Input
                        type="date"
                        value={formData.training_date}
                        onChange={(e) => setFormData({ ...formData, training_date: e.target.value })}
                        required
                        min={cycles.find(c => c.id === formData.cycle_id)?.start_date || undefined}
                        max={cycles.find(c => c.id === formData.cycle_id)?.end_date || undefined}
                    />
                    {formData.cycle_id && (
                        <p className="text-xs text-gray-500 mt-1">
                            A data deve estar dentro do período do ciclo selecionado
                        </p>
                    )}
                </div>

                {/* Local */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Local *
                    </label>
                    <Input
                        type="text"
                        placeholder=" "
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                    />
                </div>

                {/* Status Ativo */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 rounded"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Data ativa (visível para os monitores)
                    </label>
                </div>

                {/* Informação sobre turnos */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>ℹ️ Sobre os turnos:</strong> Os três turnos (Manhã, Tarde e Noite)
                        estarão disponíveis automaticamente para esta data. Os monitores poderão
                        marcar sua disponibilidade para cada turno.
                    </p>
                </div>

                {/* Mensagens de erro/sucesso */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            ✅ Data de treinamento criada com sucesso! Redirecionando...
                        </p>
                    </div>
                )}

                {/* Botões */}
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                        className="flex-1"
                    >
                        ❌ Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || cycles.length === 0}
                        className="flex-1 bg-sejoga-verde-oficial hover:bg-green-500"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Salvando...
                            </>
                        ) : (
                            <>
                                Salvar Data
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}