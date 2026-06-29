'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Plus, X } from 'lucide-react';

interface TrainingEntry {
    training_date: string;
    location: string;
}

export function AddTraining() {
    const router = useRouter();
    const supabase = createClient();

    const [cycleName, setCycleName] = useState('');
    const [entries, setEntries] = useState<TrainingEntry[]>([
        { training_date: '', location: '' }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const addEntry = () => {
        setEntries(prev => [...prev, { training_date: '', location: '' }]);
    };

    const removeEntry = (index: number) => {
        setEntries(prev => prev.filter((_, i) => i !== index));
    };

    const updateEntry = (index: number, field: keyof TrainingEntry, value: string) => {
        setEntries(prev =>
            prev.map((entry, i) =>
                i === index ? { ...entry, [field]: value } : entry
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validação: nome do ciclo
        if (!cycleName.trim()) {
            setError('Informe o nome do ciclo.');
            return;
        }

        // Ignora pares totalmente vazios
        const filledEntries = entries.filter(
            (entry) => entry.training_date || entry.location
        );

        if (filledEntries.length === 0) {
            setError('Adicione ao menos uma data de treinamento.');
            return;
        }

        // Validação: cada par preenchido precisa de data E local
        const incomplete = filledEntries.some(
            (entry) => !entry.training_date || !entry.location.trim()
        );

        if (incomplete) {
            setError('Preencha a data e o local de cada treinamento.');
            return;
        }

        setLoading(true);

        try {
            // 1. Cria o ciclo
            const { data: cycleData, error: cycleError } = await supabase
                .from('training_cycles')
                .insert([{ name: cycleName.trim(), is_active: true }])
                .select()
                .single();

            if (cycleError) throw cycleError;

            const cycleId = cycleData.id;

            // 2. Cria todos os treinamentos vinculados ao ciclo
            const trainingsToInsert = filledEntries.map((entry) => ({
                cycle_id: cycleId,
                training_date: entry.training_date,
                location: entry.location.trim(),
            }));

            const { error: trainingsError } = await supabase
                .from('trainings')
                .insert(trainingsToInsert);

            if (trainingsError) throw trainingsError;

            setSuccess(true);

            setTimeout(() => {
                router.back();
            }, 2000);

        } catch (err) {
            console.error('Erro ao criar treinamentos:', err);
            setError(err instanceof Error ? err.message : 'Erro ao criar treinamentos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                <div className="text-[35px] font-aladin text-center text-blue-800 flex-1 mb-5">
                    Novo Treinamento
                </div>

                {/* Nome do Ciclo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Ciclo *
                    </label>
                    <Input
                        type="text"
                        placeholder="Ex: Treinamentos de Maio"
                        value={cycleName}
                        onChange={(e) => setCycleName(e.target.value)}
                        required
                    />
                </div>

                {/* Datas e Locais */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Datas e Locais *
                    </label>

                    {entries.map((entry, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4 space-y-3 relative"
                        >
                            {entries.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeEntry(index)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                    title="Remover esta data"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    Data
                                </label>
                                <Input
                                    type="date"
                                    value={entry.training_date}
                                    onChange={(e) => updateEntry(index, 'training_date', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    <MapPin className="w-3 h-3 inline mr-1" />
                                    Local
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Ex.: QG"
                                    value={entry.location}
                                    onChange={(e) => updateEntry(index, 'location', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Botão de adicionar mais uma data */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addEntry}
                        className="w-full flex items-center justify-center gap-2 border-dashed border-sejoga-azul-oficial text-sejoga-azul-oficial hover:bg-blue-50"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar outra data
                    </Button>
                </div>

                {/* Mensagens de erro/sucesso */}
                {error && (
                    <div className="bg-sejoga-vermelho-oficial/10 border border-sejoga-vermelho-oficial/30 rounded-lg p-4">
                        <p className="text-sm text-sejoga-vermelho-oficial font-medium">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-sejoga-verde-oficial/10 border border-sejoga-verde-oficial/30 rounded-lg p-4">
                        <p className="text-sm text-sejoga-verde-oficial font-medium">
                            ✅ Treinamentos criados com sucesso! Redirecionando...
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
                        disabled={loading}
                        className="flex-1 bg-sejoga-verde-oficial hover:bg-sejoga-verde-chiclete text-white"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Salvando...
                            </>
                        ) : (
                            <>Salvar</>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
