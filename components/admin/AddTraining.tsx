'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, MapPin, Save } from 'lucide-react';

export function AddTraining() {
    const router = useRouter();
    const supabase = createClientComponentClient();
    
    const [formData, setFormData] = useState({
        training_date: '',
        location: '',
        is_active: true
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error: insertError } = await supabase
                .from('trainings')
                .insert([{
                    training_date: formData.training_date,
                    location: formData.location,
                    is_active: formData.is_active
                }]);

            if (insertError) throw insertError;

            setSuccess(true);
            
            // Limpa o formulário
            setFormData({
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
                <h1 className="text-2xl font-bold text-red-600">Novo Treinamento</h1>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
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
                        min={new Date().toISOString().split('T')[0]}
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
                        placeholder="Ex: Sala 201 - Prédio Principal"
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
                        Treinamento ativo (visível para os monitores)
                    </label>
                </div>

                {/* Informação sobre turnos */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>ℹ️ Sobre os turnos:</strong> Os três turnos (Manhã, Tarde e Noite) 
                        serão criados automaticamente para este treinamento. Os monitores poderão 
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
                            ✅ Treinamento criado com sucesso! Redirecionando...
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
                        className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Salvar Treinamento
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}