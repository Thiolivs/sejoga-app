import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from '@supabase/ssr';

// ✅ ADICIONE ESTA LINHA
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    try {
        if (code) {
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
            
            await supabase.auth.exchangeCodeForSession(code);
        }
    } catch (error) {
        console.log("Auth_Callback", error);
    }
    
    return NextResponse.redirect(requestUrl.origin);
}