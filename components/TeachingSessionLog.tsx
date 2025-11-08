'use client';
import { Boardgame } from '@/types/database';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Event, TeachingSessionWithDetails } from '@/types/database';
import { GameAutocomplete } from '@/components/GameAutocomplete';


export function TeachingSessionLog() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [sessions, setSessions] = useState<TeachingSessionWithDetails[]>([]);
  const [boardgames, setBoardgames] = useState<Boardgame[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetAutocomplete, setResetAutocomplete] = useState(false); // ✅ estado para resetar
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState({
    boardgame_id: '',
    players_count: '',
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
          boardgame_id: formData.boardgame_id,
          players_count: parseInt(formData.players_count), // ✅ converte para número
          notes: formData.notes || null,
        });

      if (error) throw error;

      // ✅ Resetar formulário e autocomplete
      setFormData({ boardgame_id: '', players_count: '', notes: '' });
      setResetAutocomplete(true);
      setTimeout(() => setResetAutocomplete(false), 100);

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
    const monitorName = session.monitor?.first_name || 'Desconhecido';
    if (!acc[monitorName]) {
      acc[monitorName] = [];
    }
    acc[monitorName].push(session);
    return acc;
  }, {} as Record<string, TeachingSessionWithDetails[]>);

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white/95 rounded-lg shadow p-6 space-y-4">
        <h1 className="text-[21px] text-center font-bold text-blue-800 flex-1 mb-5">
          ✨<i>Registro de Jogos Ensinados</i>✨
        </h1>

        {/* Seletor de Evento */}
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-0.5">Selecione o Evento:</label>
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
        </div>

        {/* Autocomplete de Jogo */}
        <div>
          <GameAutocomplete
            value={formData.boardgame_id}
            onChange={(gameId, gameName) =>
              setFormData({
                ...formData,
                boardgame_id: gameId,
              })
            }
            reset={resetAutocomplete} // ✅ passa o reset
            required
          />
        </div>

        {/* Número de Jogadores */}
        <div>
          <label className="block text-sm font-medium mb-1">Número de Jogadores *</label>
          <Input
            type="number"
            min="1"
            value={formData.players_count}
            onChange={(e) =>
              setFormData({
                ...formData,
                players_count: e.target.value
              })
            }
            required
          />
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        {/* Botão de Submit */}
        <div className="flex justify-center items-center gap-2">
          <Button type="submit" className="bg-sejoga-verde-oficial hover:bg-sejoga-verde-oficial">
            Registrar
          </Button>
        </div>
      </form>

      {/* Resumo do Evento */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow p-4">
        <h3 className="text-2xl text-center font-bold mb-4">
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
        <h1 className="text-[22px] text-center font-bold text-blue-800 flex-1 mb-5">
          ✨<i>Registro por Monitor</i>✨
        </h1>

        {Object.keys(sessionsByMonitor).length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Nenhum registro ainda para este evento</p>
          </div>
        ) : (
          Object.entries(sessionsByMonitor).map(([monitorName, monitorSessions]) => (
            <div key={monitorName} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-bold text-purple-700">
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
                    className="flex justify-between items-stretch p-4 bg-gray-50 rounded-lg"
                  >
                    {/* Conteúdo principal */}
                    <div className="flex-1 pr-4">
                      <h5 className="font-semibold text-blue-800">
                        🎲 {session.boardgame?.name || 'Jogo desconhecido'}
                      </h5>

                      {/* Jogadores à esquerda, data à direita */}
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400">
                          {session.players_count}{' '}
                          {session.players_count === 1 ? 'jogador' : 'jogadores'}
                        </p>
                        <p className="text-[11px] text-gray-400 italic">
                          {(() => {
                            const d = new Date(session.created_at);
                            const dia = String(d.getDate()).padStart(2, '0');
                            const mes = String(d.getMonth() + 1).padStart(2, '0');
                            const ano = String(d.getFullYear()).slice(-2);
                            const hora = d.getHours().toString().padStart(2, '0');
                            const minuto = d.getMinutes().toString().padStart(2, '0');
                            return `${dia}/${mes}/${ano} • ${hora}:${minuto}`;
                          })()}
                        </p>
                      </div>

                      {session.notes && (
                        <p className="text-sm text-gray-500 mt-2">
                          <i>{session.notes}</i>
                        </p>
                      )}
                    </div>

                    {/* Divisor vertical + botão deletar */}
                    <div className="flex flex-col justify-center items-center border-l border-gray-200 pl-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(session.id)}
                        className="text-red-600 hover:text-red-800 translate-x-1"
                      >
                        ❌
                      </Button>
                    </div>
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