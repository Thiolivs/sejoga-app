import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const token_hash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type");

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
            
            // Se tem code (OAuth flow)
            if (code) {
                await supabase.auth.exchangeCodeForSession(code);
            }
            // Se tem token_hash (email verification via custom scheme)
            else if (token_hash && type) {
                await supabase.auth.verifyOtp({ 
                    token_hash, 
                    type: type as 'signup' | 'email' | 'recovery' | 'invite' | 'magiclink'
                });
            }
            
            return NextResponse.redirect(`${requestUrl.origin}/user-app`);
        }
    } catch (error) {
        console.log("Auth_Callback", error);
    }
    
    return NextResponse.redirect(`${requestUrl.origin}/`);
}