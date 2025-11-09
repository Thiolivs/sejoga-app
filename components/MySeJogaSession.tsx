'use client';

import { useState, useEffect } from 'react';
import { User, createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProfileData {
    first_name: string;
    last_name: string;
    avatar: string;
    background: string;
}

const AVATAR_OPTIONS = [
    '/avatars/MeepleColorido.png',
    '/avatars/MeepleAzul.png',
    '/avatars/MeepleVermelho.png',
    '/avatars/1.jpg',
    '/avatars/2.png',

];

const BACKGROUND_OPTIONS = [
    '/images/backgrounds/rainbow.png',
    '/images/backgrounds/gay.png',
    '/images/backgrounds/bi.png',
    '/images/backgrounds/trans.png',
];

export function MySeJogaSession() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<ProfileData>({
        first_name: '',
        last_name: '',
        avatar: '/avatars/MeepleColorido.png',
        background: '/images/backgrounds/rainbow.png'
    });
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [showBgSelector, setShowBgSelector] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const supabase = createClientComponentClient();
    const router = useRouter();

    useEffect(() => {
        loadUserProfile();
    }, []);

    async function loadUserProfile() {
        try {
            setLoading(true);
            setError(null);

            const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

            if (userError || !currentUser) {
                console.log('Erro ao buscar usuário:', userError);
                setError('Você precisa estar logado para acessar esta página');
                setLoading(false);
                return;
            }

            setUser(currentUser);
            setEmail(currentUser.email || '');

            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar, background')
                .eq('id', currentUser.id)
                .single();

            if (profileError) {
                console.log('Erro ao buscar perfil:', profileError);
                throw profileError;
            }

            setProfile({
                first_name: data?.first_name || '',
                last_name: data?.last_name || '',
                avatar: data?.avatar || '/avatars/MeepleColorido.png',
                background: data?.background || '/images/backgrounds/rainbow.png'
            });

        } catch (err) {
            console.error('Erro ao carregar perfil:', err);
            setError('Erro ao carregar dados do perfil');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!user) return;

        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    avatar: profile.avatar,
                    background: profile.background
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            if (email !== user.email) {
                const { error: emailError } = await supabase.auth.updateUser({
                    email: email
                });

                if (emailError) throw emailError;
            }

            setSuccess(true);
            setIsEditing(false);
            router.refresh();

            setTimeout(() => setSuccess(false), 3000);

        } catch (err) {
            console.error('Erro ao salvar perfil:', err);
            setError('Erro ao salvar alterações');
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        loadUserProfile();
        setIsEditing(false);
        setShowAvatarSelector(false);
        setShowBgSelector(false);
        setError(null);
    }

    async function handleAvatarSelect(avatarPath: string) {
        if (!user) return;

        setProfile({ ...profile, avatar: avatarPath });
        setShowAvatarSelector(false);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ avatar: avatarPath })
                .eq('id', user.id);

            if (error) throw error;

            // Força atualização
            router.refresh();

            // Recarrega perfil para garantir
            await loadUserProfile();
        } catch (err) {
            console.error('Erro ao salvar avatar:', err);
            setError('Erro ao salvar avatar');
        }
    }

    async function handleBackgroundSelect(bgPath: string) {
        if (!user) return;

        setProfile({ ...profile, background: bgPath });
        setShowBgSelector(false);

        try {
            await supabase
                .from('profiles')
                .update({ background: bgPath })
                .eq('id', user.id);

            document.body.style.backgroundImage = `url(${bgPath})`;
        } catch (err) {
            console.error('Erro ao salvar background:', err);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                    <p className="text-red-600 text-sm mb-2">Você precisa estar logado</p>
                    <a href="/login" className="text-blue-600 hover:underline text-sm">Ir para o login</a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow p-4">
                <div className="pl-5 flex justify-between items-center mb-4">
                    <h1 className="text-[30px] font-aladin text-blue-800">Meu espaço</h1>
                    {!isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            Editar Perfil
                        </Button>
                    )}
                </div>

                {error && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                        Perfil atualizado com sucesso!
                    </div>
                )}

                <div className="space-y-4">
                    {/* Avatar e Background Section - Lado a Lado */}
                    <div className="grid grid-cols-2 gap-4 pb-3 border-b">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-2">
                            <Avatar className="h-23 w-23">
                                <AvatarImage src={profile.avatar} alt="Avatar" />
                                <AvatarFallback>
                                    {profile.first_name ? profile.first_name[0]?.toUpperCase() : '?'}
                                </AvatarFallback>
                            </Avatar>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowAvatarSelector(!showAvatarSelector);
                                    setShowBgSelector(false);
                                }}
                                className="text-xs h-1"
                            >
                                Alterar Avatar
                            </Button>
                        </div>

                        {/* Background */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative h-20 w-32 rounded overflow-hidden border-2 border-gray-300">
                                <Image src={profile.background} alt="Background" fill className="object-cover" />
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowBgSelector(!showBgSelector);
                                    setShowAvatarSelector(false);
                                }}
                                className="text-xs h-7"
                            >
                                Alterar Fundo
                            </Button>
                        </div>
                    </div>

                    {/* Seletores - Aparecem abaixo */}
                    {showAvatarSelector && (
                        <div className="flex gap-2 p-3 bg-gray-50 rounded-lg justify-center border-b">
                            {AVATAR_OPTIONS.map((avatarPath) => (
                                <button
                                    key={avatarPath}
                                    onClick={() => handleAvatarSelect(avatarPath)}
                                    className={`relative h-12 w-12 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${profile.avatar === avatarPath
                                        ? 'border-blue-600 ring-2 ring-blue-200'
                                        : 'border-gray-300 hover:border-blue-400'
                                        }`}
                                >
                                    <Image src={avatarPath} alt="Avatar" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {showBgSelector && (
                        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg border-b">
                            {BACKGROUND_OPTIONS.map((bgPath) => (
                                <button
                                    key={bgPath}
                                    onClick={() => handleBackgroundSelect(bgPath)}
                                    className={`relative h-20 rounded overflow-hidden border-2 transition-all hover:scale-105 ${profile.background === bgPath
                                        ? 'border-blue-600 ring-2 ring-blue-200'
                                        : 'border-gray-300 hover:border-blue-400'
                                        }`}
                                >
                                    <Image src={bgPath} alt="Background" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Nome e Sobrenome */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profile.first_name}
                                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Seu nome"
                                />
                            ) : (
                                <p className="px-2 py-1.5 text-sm bg-gray-50 rounded text-gray-900">
                                    {profile.first_name || 'Não informado'}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Sobrenome</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profile.last_name}
                                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Seu sobrenome"
                                />
                            ) : (
                                <p className="px-2 py-1.5 text-sm bg-gray-50 rounded text-gray-900">
                                    {profile.last_name || 'Não informado'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">E-mail</label>
                        {isEditing ? (
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                placeholder="seu@email.com"
                            />
                        ) : (
                            <p className="px-2 py-1.5 text-sm bg-gray-50 rounded text-gray-900">
                                {email || 'Não informado'}
                            </p>
                        )}
                    </div>

                    {/* Botões */}
                    {isEditing && (
                        <div className="flex gap-2 pt-1">
                            <Button onClick={handleSave} disabled={saving} size="sm" className="flex-1 h-8 text-xs">
                                {saving ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button onClick={handleCancel} disabled={saving} variant="outline" size="sm" className="flex-1 h-8 text-xs">
                                Cancelar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}