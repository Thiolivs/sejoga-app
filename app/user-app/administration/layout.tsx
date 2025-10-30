import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdministrationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createServerComponentClient({ cookies });

    // Verifica autenticação
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        redirect('/');
    }

    // Verifica se é admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/user-app');
    }

    return <>{children}</>;
}