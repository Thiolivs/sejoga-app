
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdministrationLayoutClient } from '@/components/AdministrationLayoutClient';

export default async function AdministrationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Pode falhar em Server Components
                    }
                },
            },
        }
    );

    // Verifica autenticação
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        redirect('/');
    }

    // Verifica se é admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/user-app');
    }

    return <AdministrationLayoutClient>{children}</AdministrationLayoutClient>;
}