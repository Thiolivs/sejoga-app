'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ArrowLeft, Building2 } from 'lucide-react';

interface Publisher {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    created_at: string;
    updated_at: string;
}

export function ManagePublishers() {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });

    useEffect(() => {
        fetchPublishers();
    }, []);

    const fetchPublishers = async () => {
        try {
            const { data, error } = await supabase
                .from('publishers')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;
            setPublishers(data || []);
        } catch (err) {
            console.error('Erro ao carregar editoras:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('publishers')
                    .update({
                        name: formData.name,
                        phone: formData.phone || null,
                        email: formData.email || null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('publishers')
                    .insert([{
                        name: formData.name,
                        phone: formData.phone || null,
                        email: formData.email || null
                    }]);

                if (error) throw error;
            }

            resetForm();
            await fetchPublishers();
        } catch (err) {
            console.error('Erro ao salvar editora:', err);
            alert('Erro ao salvar editora. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (publisher: Publisher) => {
        setFormData({
            name: publisher.name,
            phone: publisher.phone || '',
            email: publisher.email || ''
        });
        setEditingId(publisher.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;

        try {
            const { error } = await supabase
                .from('publishers')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchPublishers();
        } catch (err) {
            console.error('Erro ao deletar editora:', err);
            alert('Erro ao deletar editora.');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: ''
        });
        setEditingId(null);
        setShowAddForm(false);
    };

    if (loading && publishers.length === 0) {
        return <div className="p-4 text-center">Carregando...</div>;
    }

    return (
        <div className="space-y-6">

            <div className='bg-white/95 rounded-xl pt-6 p-3'>
                <h1 className="text-[23px] text-center font-bold text-blue-800 flex-1 mb-6">✨<i>Gerenciamento de Editoras</i>✨</h1>
                {!showAddForm && (
                    <div className="flex justify-center items-center pb-6">

                        <Button onClick={() => setShowAddForm(true)} className="bg-sejoga-azul-oficial flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Cadastrar Nova Editora
                        </Button>
                    </div>
                )}
                {/* Formulário */}
                {showAddForm && (
                    <form onSubmit={handleSubmit} className="bg-white border-2 border-blue-200 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                {editingId ? 'Editar Editora' : 'Nova Editora'}
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
                                placeholder="Ex: Devir, Galápagos, Papergames"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Telefone
                            </label>
                            <Input
                                type="text"
                                placeholder="(11) 98765-4321"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <Input
                                type="email"
                                placeholder="contato@editora.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

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

                {/* Lista de editoras */}
                <div className="space-y-3">
                    {publishers.map((publisher) => (
                        <div
                            key={publisher.id}
                            className="bg-white border rounded-lg p-3"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="w-5 h-5 text-gray-600" />
                                        <h3 className="font-semibold text-lg">{publisher.name}</h3>
                                    </div>
                                    {publisher.phone && (
                                        <p className="text-sm text-gray-600">📞 {publisher.phone}</p>
                                    )}
                                    {publisher.email && (
                                        <p className="text-sm text-gray-600">✉️ {publisher.email}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        className='p-3'
                                        variant="outline"
                                        onClick={() => handleEdit(publisher)}
                                    >
                                        ✏️ Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleDelete(publisher.id, publisher.name)}
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        ❌
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {publishers.length === 0 && !showAddForm && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">
                                Nenhuma editora cadastrada ainda.
                            </p>
                            <Button onClick={() => setShowAddForm(true)} className="mx-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                Criar Primeira Editora
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}