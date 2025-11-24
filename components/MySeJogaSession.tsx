'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProfileData {
    first_name: string;
    last_name: string;
    avatar: string;
    background: string;
}

const AVATAR_OPTIONS = [
    '/avatars/AvatarDracula.png',
    '/avatars/AvatarZombie.png',
    '/avatars/AvatarNatalino.png',
    '/avatars/AvatarOrgulhoNerd.png',
    '/avatars/AvatarBarbie.png',
    '/avatars/Botton5Anos.jpg',
    '/avatars/BottonCoisaEstranha1.jpg',
    '/avatars/BottonCoisaEstranha2.jpg',
    '/avatars/BottonSemCensura.jpg',
    '/avatars/BottonTrans.jpg',
    '/avatars/MeepleVermelho.png',
    '/avatars/MeepleAzul.png',
    '/avatars/MeepleLaranja.png',
    '/avatars/MeepleVerde.png',
    '/avatars/MeepleRosa.png',
    '/avatars/MeepleColorido.png',
];

const BACKGROUND_OPTIONS = [
    '/images/backgrounds/rainbow.jpg',
    '/images/backgrounds/lesbica.png',
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
        background: '/images/backgrounds/rainbow.jpg'
    });
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [showBgSelector, setShowBgSelector] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const supabase = createClient();
    const router = useRouter();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        async function loadUserProfile() {
            try {
                setLoading(true);
                setError(null);

                const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

                console.log('🔍 MySeJoga - User:', currentUser);
                console.log('🔍 MySeJoga - Error:', userError);

                if (userError || !currentUser) {
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
                    background: data?.background || '/images/backgrounds/rainbow.jpg'
                });

            } catch (err) {
                console.error('Erro ao carregar perfil:', err);
                setError('Erro ao carregar dados do perfil');
            } finally {
                setLoading(false);
            }
        }

        loadUserProfile();
    }, [supabase]);

    async function handleSave() {
        if (!user) return;

        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            // Se o email mudou, pedir confirmação
            if (email !== user.email) {
                const confirmVerification = window.confirm(
                    `📧 Um email de confirmação será enviado para:\n\n${email}\n\n` +
                    `Você precisará clicar no link do email para confirmar a alteração.\n\n` +
                    `Deseja continuar?`
                );

                if (!confirmVerification) {
                    setSaving(false);
                    return;
                }
            }

            // Atualiza perfil
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

            // Atualiza email se mudou
            if (email !== user.email) {
                const { error: emailError } = await supabase.auth.updateUser({
                    email: email
                });

                if (emailError) throw emailError;

                alert('✅ Email de confirmação enviado!\n\nVerifique sua caixa de entrada (e spam) para confirmar a alteração.');
            } else {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }

            setIsEditing(false);
            router.refresh();

        } catch (err) {
            console.error('Erro ao salvar perfil:', err);

            if (err && typeof err === 'object' && 'message' in err &&
                typeof err.message === 'string' && err.message.includes('email')) {
                setError('Erro ao atualizar email. Verifique se o email é válido.');
            } else {
                setError('Erro ao salvar alterações');
            }
        } finally {
            setSaving(false);
        }
    }

    async function handleCancel() {
        setIsEditing(false);
        setShowAvatarSelector(false);
        setShowBgSelector(false);
        setError(null);

        // Recarrega os dados originais
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) return;

            setEmail(currentUser.email || '');

            const { data } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar, background')
                .eq('id', currentUser.id)
                .single();

            if (data) {
                setProfile({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    avatar: data.avatar || '/avatars/MeepleColorido.png',
                    background: data.background || '/images/backgrounds/rainbow.jpg'
                });
            }
        } catch (err) {
            console.error('Erro ao recarregar perfil:', err);
        }
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

            router.refresh();
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

            // ✅ Aplica no pseudo-elemento
            const style = document.createElement('style');
            style.id = 'dynamic-bg';
            style.innerHTML = `body::before { background-image: url(${bgPath}); }`;

            const oldStyle = document.getElementById('dynamic-bg');
            if (oldStyle) oldStyle.remove();

            document.head.appendChild(style);
        } catch (err) {
            console.error('Erro ao salvar background:', err);
        }
    }

    async function handlePasswordChange() {
        if (!newPassword || !confirmPassword) {
            setError('Preencha ambos os campos de senha');
            return;
        }

        if (newPassword.length < 7) {
            setError('A senha deve ter no mínimo 7 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        const confirmChange = window.confirm(
            '🔒 Você está prestes a alterar sua senha.\n\n' +
            'Após a alteração, você precisará usar a nova senha para fazer login.\n\n' +
            'Deseja continuar?'
        );

        if (!confirmChange) return;

        try {
            setSaving(true);
            setError(null);

            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            alert('✅ Senha alterada com sucesso!');
            setIsChangingPassword(false);
            setNewPassword('');
            setConfirmPassword('');

        } catch (err) {
            console.error('Erro ao alterar senha:', err);
            setError('Erro ao alterar senha. Tente novamente.');
        } finally {
            setSaving(false);
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
                </div>
            </div>
        );
    }

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);

            // Chama a função do Supabase para deletar
            const { error } = await supabase.rpc('delete_user_account');

            if (error) throw error;

            // Fecha dialog de confirmação e abre de sucesso
            setShowDeleteDialog(false);
            setShowSuccessDialog(true);

            // Aguarda 2 segundos e desloga
            setTimeout(async () => {
                await supabase.auth.signOut();
                sessionStorage.removeItem('sejoga-session-active');
                localStorage.removeItem('userapp-active-tab');
                router.push('/');
                router.refresh();
            }, 2000);

        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            alert('Erro ao excluir conta. Tente novamente.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-center mb-4">
                    <h1 className="text-[30px] font-aladin text-blue-800">Meu espaço</h1>

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
                    {/* Avatar e Background Section */}
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

                    {/* Seletores */}
                    {showAvatarSelector && (
                        <div className="grid grid-cols-5 gap-2 p-3 bg-gray-50 rounded-lg border-b">
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

                    {/* Informações e Editar*/}

                    <div className="flex justify-between items-center mb-5">
                        <label className="block text-xs font-semibold text-gray-700">Meus dados</label>
                        {!isEditing && (
                            <Button variant="outline"
                                size="sm"
                                className="text-xs h-6 text-red-700"
                                onClick={() => setIsEditing(true)}>
                                Alterar dados
                            </Button>
                        )}

                    </div>


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
                            />
                        ) : (
                            <p className="px-2 py-1.5 text-sm bg-gray-50 rounded text-gray-900">
                                {email || 'Não informado'}
                            </p>
                        )}
                    </div>

                    {/* Alterar Senha */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-semibold text-gray-700">Senha</label>
                            {!isChangingPassword && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsChangingPassword(true)}
                                    className="text-xs h-6  text-red-700"
                                >
                                    Alterar Senha
                                </Button>
                            )}
                        </div>

                        {isChangingPassword ? (
                            <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Nova Senha
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Mínimo 7 caracteres"
                                        minLength={7}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Confirmar Nova Senha
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Digite a senha novamente"
                                        minLength={7}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handlePasswordChange}
                                        disabled={saving}
                                        size="sm"
                                        className="flex-1 h-7 text-xs"
                                    >
                                        {saving ? 'Alterando...' : 'Confirmar'}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setNewPassword('');
                                            setConfirmPassword('');
                                            setError(null);
                                        }}
                                        disabled={saving}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 h-7 text-xs"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="px-2 py-1.5 text-sm bg-gray-50 rounded text-gray-900">
                                ••••••••
                            </p>
                        )}
                    </div>


                    {/* ✅ Seção de Exclusão de Conta */}
                    <div className="border-t pt-4 mt-8">
                        <div className="bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex text-red-800 items-start justify-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="ml-4"
                                >
                                    Excluir minha conta
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* ✅ Dialog de Confirmação */}
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso irá excluir permanentemente sua conta
                                    e remover todos os seus dados dos nossos servidores.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>
                                    Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {isDeleting ? 'Excluindo...' : 'Sim, excluir minha conta'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* ✅ Dialog de Sucesso */}
                    <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-green-600">
                                    Conta excluída com sucesso!
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Seus dados foram removidos. Você será redirecionado para a tela de login.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                        </AlertDialogContent>
                    </AlertDialog>



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