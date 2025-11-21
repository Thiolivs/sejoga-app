import { UserAppHeader } from "@/components/UserAppHeader"
import { UserAppContent } from "@/components/UserAppContent"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from '@supabase/ssr'

export default async function UserApp() {
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
                    } catch {}
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email || '';

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header fixo */}
            <UserAppHeader />
            
            {/* Conteúdo com scroll */}
            <div className="flex-1 overflow-y-auto">
                <UserAppContent userEmail={userEmail} />
            </div>
        </div>
    );
}