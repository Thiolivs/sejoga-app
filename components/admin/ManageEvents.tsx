'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Event } from '@/types/database';
import { Plus } from 'lucide-react';

export function ManageEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEvent) {
        // Atualizar
        const { error } = await supabase
          .from('events')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
      } else {
        // Criar novo
        const { error } = await supabase
          .from('events')
          .insert(formData);

        if (error) throw error;
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert('❌ Erro ao salvar evento');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || '',
      event_date: event.event_date,
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      location: event.location || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Tem certeza que deseja deletar este evento?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      fetchEvents();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      alert('❌ Erro ao deletar evento');
    }
  };

  const toggleActive = async (eventId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_active: !currentState })
        .eq('id', eventId);

      if (error) throw error;
      fetchEvents();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      event_date: '',
      start_time: '',
      end_time: '',
      location: '',
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando eventos...</div>;
  }

  return (
    <div className="space-y-6 bg-white/95 border pt-6 rounded-lg p-3">
      <div className="text-[35px] font-aladin text-center text-blue-800 flex-1 mb-5">Gerenciar Eventos</div>

      <div className="flex justify-center items-center">
        <Button
          onClick={() => setShowForm(!showForm)} className="bg-sejoga-azul-oficial hover:bg-blue-400"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Evento
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border-1 rounded-lg shadow p-6 space-y-4">
          <h3 className="text-xl font-bold">
            {editingEvent ? 'Editar Evento' : 'Novo Evento'}
          </h3>

          <div>
            <label className="block text-sm font-medium mb-1">Nome do Evento *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder=""
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data *</label>
              <Input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Início *</label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fim *</label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Local</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder=""
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-sejoga-verde-oficial hover:bg-sejoga-verde-giz">
              Salvar
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              ❌ Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Lista de Eventos */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Nenhum evento cadastrado ainda</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`bg-white border-1 rounded-lg shadow p-6 ${!event.is_active ? 'opacity-60' : ''
                }`}
            >
              <div className="flex flex-col gap-3">
                {/* Conteúdo do evento */}
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">{event.name}</h3>
                  {!event.is_active && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                      Inativo
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="text-gray-600">{event.description}</p>
                )}
                <div className="flex gap-4 text-sm text-gray-600">

                  <span>📅 {new Date(event.event_date).toLocaleDateString('pt-BR')}</span>
                  {event.start_time && <span>🕐 {event.start_time}</span>}
                  {event.location && <span>📌 {event.location}</span>}
                </div>

                {/* Botões embaixo */}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(event.id, event.is_active)}
                  >
                    {event.is_active ? 'Ativo' : 'Inativo'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(event)}
                  >
                    ✏️ Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"

                    onClick={() => handleDelete(event.id)}
                  >
                    ❌ Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}