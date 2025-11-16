import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Atualiza a sessão do usuário
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Se não estiver logado e tentar acessar área protegida, redireciona
    if (!user && request.nextUrl.pathname.startsWith('/user-app')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Se estiver logado e tentar acessar login, redireciona
    if (user && request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/user-app', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}