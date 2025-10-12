'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBoardgames } from '@/hooks/useBoardgames';
import { useUser } from '@/hooks/useUser'; // assumindo que você tem isso
import type { BoardgameWithTeachers, Profile } from '@/types/database';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export function BoardgameList() {
    const { user } = useUser();
    const { boardgames, loading, toggleTeach, getGameTeachers } = useBoardgames(user?.id);
    const [selectedGame, setSelectedGame] = useState<BoardgameWithTeachers | null>(null);
    const [teachers, setTeachers] = useState<Profile[]>([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);

    
    const handleGameClick = async (game: BoardgameWithTeachers) => {
        setSelectedGame(game);
        setLoadingTeachers(true);
        const teachersList = await getGameTeachers(game.id);
        setTeachers(teachersList);
        setLoadingTeachers(false);
    };

    if (loading) {
        return <div className="p-4">Carregando jogos...</div>;
    }

    return (
        <div className="space-y-4 p-4">
            <h2 className="text-2xl font-bold">Meus Jogos</h2>

            {boardgames.map((game) => (
                <Card key={game.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex-1 cursor-pointer" onClick={() => handleGameClick(game)}>
                            <h3 className="font-semibold text-lg">{game.name}</h3>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {game.publisher && (
                                    <Badge variant="outline">{game.publisher}</Badge>
                                )}
                                {game.players_min && game.players_max && (
                                    <Badge variant="outline">
                                        {game.players_min}-{game.players_max} players
                                    </Badge>
                                )}
                                {game.coop && <Badge>coop</Badge>}
                                {game.comp && <Badge>comp</Badge>}
                                {game.kids && <Badge variant="secondary">kids</Badge>}
                                {game.expansion && <Badge variant="destructive">Expansão</Badge>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            <Checkbox
                                id={`teach-${game.id}`}
                                checked={game.canTeach}
                                onCheckedChange={() => toggleTeach(game.id, game.canTeach || false)}
                            />
                            <label
                                htmlFor={`teach-${game.id}`}
                                className="text-sm cursor-pointer whitespace-nowrap"
                            >
                                Sei ensinar
                            </label>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Modal com lista de professores */}
            <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedGame?.name}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Informações do Jogo</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {selectedGame?.publisher && (
                                    <>
                                        <span className="text-muted-foreground">publisher:</span>
                                        <span>{selectedGame.publisher}</span>
                                    </>
                                )}
                                {selectedGame?.year_release && (
                                    <>
                                        <span className="text-muted-foreground">Lançamento:</span>
                                        <span>{selectedGame.year_release}</span>
                                    </>
                                )}
                                {selectedGame?.players_min && selectedGame?.players_max && (
                                    <>
                                        <span className="text-muted-foreground">players:</span>
                                        <span>{selectedGame.players_min} - {selectedGame.players_max}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Quem sabe ensinar</h4>
                            {loadingTeachers ? (
                                <p className="text-sm text-muted-foreground">Carregando...</p>
                            ) : teachers.length > 0 ? (
                                <ul className="space-y-2">
                                    {teachers.map((teacher) => (
                                        <li key={teacher.id} className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                {teacher.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{teacher.name}</p>
                                                <p className="text-xs text-muted-foreground">{teacher.email}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Ninguém marcou que sabe ensinar este jogo ainda.
                                </p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}