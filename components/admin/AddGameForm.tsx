'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

// Schema corrigido
const formSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    publisher: z.string().optional(),
    year_received: z.number().int().positive().optional(),
    year_release: z.number().int().positive().optional(),
    players_min: z.number().int().positive().optional(),
    players_max: z.number().int().positive().optional(),
    copies: z.number().int().positive(),
    expansion: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface GameMechanic {
    id: string;
    name: string;
    slug: string;
    type: 'mechanic' | 'category' | 'mode';
}

export function AddGameForm({ onSuccess }: { onSuccess?: () => void }) {
    const [mechanics, setMechanics] = useState<GameMechanic[]>([]);
    const [selectedMechanics, setSelectedMechanics] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const supabase = createClientComponentClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            publisher: undefined,
            year_received: undefined,
            year_release: undefined,
            players_min: undefined,
            players_max: undefined,
            copies: 1,
            expansion: false,
        },
    });

    useEffect(() => {
        fetchMechanics();
    }, []);

    const fetchMechanics = async () => {
        const { data, error } = await supabase
            .from('game_mechanics')
            .select('*')
            .order('name');

        if (!error && data) {
            setMechanics(data);
        }
    };

    const toggleMechanic = (mechanicId: string) => {
        setSelectedMechanics((prev) =>
            prev.includes(mechanicId)
                ? prev.filter((id) => id !== mechanicId)
                : [...prev, mechanicId]
        );
    };

    const onSubmit = async (values: FormValues) => {
        try {
            setLoading(true);

            // 1. Inserir o jogo
            const { data: game, error: gameError } = await supabase
                .from('boardgames')
                .insert({
                    name: values.name,
                    publisher: values.publisher || null,
                    year_received: values.year_received || null,
                    year_release: values.year_release || null,
                    players_min: values.players_min || null,
                    players_max: values.players_max || null,
                    copies: values.copies,
                    expansion: values.expansion,
                    active: true,
                })
                .select()
                .single();

            if (gameError) throw gameError;

            // 2. Associar mecânicas
            if (selectedMechanics.length > 0) {
                const mechanicsToInsert = selectedMechanics.map((mechanicId) => ({
                    boardgame_id: game.id,
                    mechanic_id: mechanicId,
                }));

                const { error: mechanicsError } = await supabase
                    .from('boardgame_mechanics')
                    .insert(mechanicsToInsert);

                if (mechanicsError) throw mechanicsError;
            }

            alert('✅ Jogo adicionado com sucesso!');
            form.reset();
            setSelectedMechanics([]);
            if (onSuccess) onSuccess();
        } catch (error) { 
            console.error('Erro ao adicionar jogo:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            alert(`❌ Erro: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const mechanicsByType = {
        category: mechanics.filter((m) => m.type === 'category'),
        mechanic: mechanics.filter((m) => m.type === 'mechanic'),
        mode: mechanics.filter((m) => m.type === 'mode'),
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-6">Adicionar Novo Jogo</h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Informações*/}
                    <div className="space-y-4">
                        {/* Nome */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Jogo *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Catan" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Editora */}
                        <FormField
                            control={form.control}
                            name="publisher"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Editora</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: Devir"
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Anos */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="year_release"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ano de Lançamento</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="2020"
                                                value={field.value || ''}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value ? parseInt(e.target.value) : undefined
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="year_received"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ano de Recebimento</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="2024"
                                                value={field.value || ''}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value ? parseInt(e.target.value) : undefined
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Jogadores */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="players_min"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mínimo de Jogadores</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="2"
                                                value={field.value || ''}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value ? parseInt(e.target.value) : undefined
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="players_max"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Máximo de Jogadores</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="4"
                                                value={field.value || ''}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value ? parseInt(e.target.value) : undefined
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Cópias */}
                        <FormField
                            control={form.control}
                            name="copies"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número de Cópias</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={field.value}
                                            onChange={(e) =>
                                                field.onChange(parseInt(e.target.value) || 1)
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tipo */}
                        <div className="flex gap-6">
                            <FormField
                                control={form.control}
                                name="expansion"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="!mt-0 cursor-pointer">
                                            Expansão
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Categorias */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold border-b pb-2">Categorias</h3>
                        <div className="flex gap-2 flex-wrap">
                            {mechanicsByType.category.map((mechanic) => (
                                <label
                                    key={mechanic.id}
                                    className={`px-3 py-1.5 text-sm rounded cursor-pointer transition-all ${selectedMechanics.includes(mechanic.id)
                                        ? 'bg-sejoga-azul-oficial text-white shadow-md scale-105'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedMechanics.includes(mechanic.id)}
                                        onChange={() => toggleMechanic(mechanic.id)}
                                    />
                                    {mechanic.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Mecânicas */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold border-b pb-2">
                            Mecânicas de Jogo
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                            {mechanicsByType.mechanic.map((mechanic) => (
                                <label
                                    key={mechanic.id}
                                    className={`px-3 py-1.5 rounded text-sm cursor-pointer transition-all ${selectedMechanics.includes(mechanic.id)
                                        ? 'bg-sejoga-rosa-oficial text-white shadow-md scale-105'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedMechanics.includes(mechanic.id)}
                                        onChange={() => toggleMechanic(mechanic.id)}
                                    />
                                    {mechanic.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Modos */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold border-b pb-2">Modos</h3>
                        <div className="flex gap-2 flex-wrap">
                            {mechanicsByType.mode.map((mechanic) => (
                                <label
                                    key={mechanic.id}
                                    className={`px-3 py-1.5 rounded text-sm cursor-pointer transition-all ${selectedMechanics.includes(mechanic.id)
                                        ? 'bg-sejoga-laranja-oficial text-white shadow-md scale-105'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={selectedMechanics.includes(mechanic.id)}
                                        onChange={() => toggleMechanic(mechanic.id)}
                                    />
                                    {mechanic.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-sejoga-verde-oficial hover:bg-green-500"
                        >
                            {loading ? 'Adicionando...' : 'Atualizar Jogo'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                form.reset();
                                setSelectedMechanics([]);
                            }}
                            disabled={loading}
                        >
                            ❌ Limpar
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}