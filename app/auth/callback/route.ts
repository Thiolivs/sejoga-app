import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const token_hash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type");

    let confirmed = false;

    try {
        if (code || token_hash) {
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

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (!error) confirmed = true;
            } else if (token_hash && type) {
                const { error } = await supabase.auth.verifyOtp({
                    token_hash,
                    type: type as 'signup' | 'email' | 'recovery' | 'invite' | 'magiclink'
                });
                if (!error) confirmed = true;
            }
        }
    } catch (error) {
        console.log("Auth_Callback", error);
    }

    // Não cria sessão automática. Manda para o login.
    // Se confirmou, sinaliza sucesso para a tela de login exibir uma mensagem.
    const destination = confirmed ? `${requestUrl.origin}/?confirmed=1` : `${requestUrl.origin}/`;
    return NextResponse.redirect(destination);
}