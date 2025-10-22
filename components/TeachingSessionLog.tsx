'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Event, TeachingSessionWithDetails } from '@/types/database';

export function TeachingSessionLog() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [sessions, setSessions] = useState<TeachingSessionWithDetails[]>([]);
  const [boardgames, setBoardgames] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState({
    boardgame_id: '',
    players_count: 0,
    notes: '',
  });

  useEffect(() => {
    fetchEvents();
    fetchBoardgames();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchSessions();
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      
      if (data && data.length > 0) {
        setSelectedEvent(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardgames = async () => {
    try {
      const { data, error } = await supabase
        .from('boardgames')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setBoardgames(data || []);
    } catch (error) {
      console.error('Erro ao buscar jogos:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('teaching_sessions')
        .select(`
          *,
          monitor:profiles!monitor_id (id, first_name, last_name, name),
          boardgame:boardgames!boardgame_id (id, name),
          event:events!event_id (id, name)
        `)
        .eq('event_id', selectedEvent)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('teaching_sessions')
        .insert({
          event_id: selectedEvent,
          monitor_id: user.id,
          ...formData,
        });

      if (error) throw error;

      alert('✅ Sessão registrada com sucesso!');
      setFormData({ boardgame_id: '', players_count: 0, notes: '' });
      setShowForm(false);
      fetchSessions();
    } catch (error) {
      console.error('Erro ao registrar sessão:', error);
      alert('❌ Erro ao registrar sessão');
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Tem certeza que deseja deletar este registro?')) return;

    try {
      const { error } = await supabase
        .from('teaching_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      alert('✅ Registro deletado!');
      fetchSessions();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('❌ Erro ao deletar');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">Nenhum evento ativo. Crie um evento primeiro!</p>
      </div>
    );
  }

  // Agrupar sessões por monitor
  const sessionsByMonitor = sessions.reduce((acc, session) => {
    const monitorName = session.monitor?.name || session.monitor?.first_name || 'Desconhecido';
    if (!acc[monitorName]) {
      acc[monitorName] = [];
    }
    acc[monitorName].push(session);
    return acc;
  }, {} as Record<string, TeachingSessionWithDetails[]>);

  return (
    <div className="space-y-6">
      {/* Seletor de Evento */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Selecione o Evento:</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} - {new Date(event.event_date).toLocaleDateString('pt-BR')}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            {showForm ? '✕ Cancelar' : '➕ Registrar Ensino'}
          </Button>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-xl font-bold">Registrar Ensino de Jogo</h3>

          <div>
            <label className="block text-sm font-medium mb-1">Jogo *</label>
            <select
              value={formData.boardgame_id}
              onChange={(e) => setFormData({ ...formData, boardgame_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Selecione um jogo</option>
              {boardgames.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Número de Jogadores *</label>
            <Input
              type="number"
              min="0"
              value={formData.players_count}
              onChange={(e) =>
                setFormData({ ...formData, players_count: parseInt(e.target.value) || 0 })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione observações sobre a sessão..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              💾 Salvar
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Resumo do Evento */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold mb-4">
          {events.find(e => e.id === selectedEvent)?.name}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{Object.keys(sessionsByMonitor).length}</p>
            <p className="text-purple-100 text-sm">Monitores Ativos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{sessions.length}</p>
            <p className="text-purple-100 text-sm">Jogos Ensinados</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">
              {sessions.reduce((sum, s) => sum + s.players_count, 0)}
            </p>
            <p className="text-purple-100 text-sm">Total de Jogadores</p>
          </div>
        </div>
      </div>

      {/* Lista por Monitor */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Registros por Monitor</h3>

        {Object.keys(sessionsByMonitor).length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Nenhum registro ainda para este evento</p>
          </div>
        ) : (
          Object.entries(sessionsByMonitor).map(([monitorName, monitorSessions]) => (
            <div key={monitorName} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-bold text-purple-600">
                  👨‍🏫 {monitorName}
                </h4>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                  {monitorSessions.length} {monitorSessions.length === 1 ? 'jogo' : 'jogos'}
                </span>
              </div>

              <div className="space-y-3">
                {monitorSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">
                        🎲 {session.boardgame?.name || 'Jogo desconhecido'}
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">
                        👥 {session.players_count} {session.players_count === 1 ? 'jogador' : 'jogadores'}
                      </p>
                      {session.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">
                          📝 {session.notes}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(session.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(session.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}