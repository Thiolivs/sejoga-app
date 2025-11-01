'use client';
import { Boardgame } from '@/types/database';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Event, TeachingSessionWithDetails } from '@/types/database';
import { ArrowLeft } from 'lucide-react';

export function StatisticsSession() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<string>('');
    const [sessions, setSessions] = useState<TeachingSessionWithDetails[]>([]);
    const [boardgames, setBoardgames] = useState<Boardgame[]>([]);
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
        <div className="min-h-screen">

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Seu componente de eventos aqui */}
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                                    <p className="text-yellow-800">
                                        🚧 Em desenvolvimento - Em breve uma nova página para você!
                                    </p>
                                </div>
            </main>
        </div>
    );
}