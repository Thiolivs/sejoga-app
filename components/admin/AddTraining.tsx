'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin } from 'lucide-react';
import type { TrainingCycle } from '@/types/database';

export function AddTraining() {
    const router = useRouter();
    const supabase = createClient();

    const [cycles, setCycles] = useState<TrainingCycle[]>([]);
    const [formData, setFormData] = useState({
        cycle_id: '',
        training_date: '',
        location: ''
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
                .order('created_at', { ascending: false });

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
            const { error: insertError } = await supabase
                .from('trainings')
                .insert([{
                    cycle_id: formData.cycle_id,
                    training_date: formData.training_date,
                    location: formData.location
                }]);

            if (insertError) throw insertError;

            setSuccess(true);

            // Limpa o formulário
            setFormData({
                cycle_id: '',
                training_date: '',
                location: ''
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
                <div className="text-[35px] font-aladin text-center text-blue-800 flex-1 mb-5">
                    Novo Treinamento
                </div>

                {/* Seleção de Ciclo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciclo de Treinamento *
                    </label>
                    <select
                        value={formData.cycle_id}
                        onChange={(e) => setFormData({ ...formData, cycle_id: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sejoga-azul-oficial"
                    >
                        <option value="">Selecione um ciclo</option>
                        {cycles.map((cycle) => (
                            <option key={cycle.id} value={cycle.id}>
                                {cycle.name}
                            </option>
                        ))}
                    </select>

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
                    />
                </div>

                {/* Local */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Local *
                    </label>
                    <Input
                        type="text"
                        placeholder="Ex: Sede do SeJoga"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                    />
                </div>

                {/* Informação sobre turnos 
                <div className="bg-sejoga-azul-oficial/10 border border-sejoga-azul-oficial/30 rounded-lg p-4">
                    <p className="text-sm text-gray-800">
                        <strong>ℹ️ Sobre os turnos:</strong> Os três turnos (Manhã, Tarde e Noite)
                        estarão disponíveis automaticamente para esta data. Os monitores poderão
                        marcar sua disponibilidade para cada turno.
                    </p>
                </div>*/}

                {/* Mensagens de erro/sucesso */}
                {error && (
                    <div className="bg-sejoga-vermelho-oficial/10 border border-sejoga-vermelho-oficial/30 rounded-lg p-4">
                        <p className="text-sm text-sejoga-vermelho-oficial font-medium">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-sejoga-verde-oficial/10 border border-sejoga-verde-oficial/30 rounded-lg p-4">
                        <p className="text-sm text-sejoga-verde-oficial font-medium">
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
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || cycles.length === 0}
                        className="flex-1 bg-sejoga-verde-oficial hover:bg-sejoga-verde-chiclete text-white"
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