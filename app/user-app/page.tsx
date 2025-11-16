import { UserAppContent } from "@/components/UserAppContent";
import { UserAppHeader } from "@/components/UserAppHeader";
import { createServerClient } from '@supabase/ssr';
import { cookies } from "next/headers";

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

    // Middleware já garante que tem usuário aqui
    return (
        <div className="min-h-screen">
            <UserAppHeader />
            <UserAppContent userEmail={user?.email || ""} />
        </div>
    );
}