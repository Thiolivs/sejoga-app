import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    // Para client components, usamos document.cookie
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2) return parts.pop()?.split(';').shift();
                },
                set(name: string, value: string, options: any) {
                    document.cookie = `${name}=${value}; path=/; ${options.maxAge ? `max-age=${options.maxAge};` : ''} ${options.sameSite ? `samesite=${options.sameSite};` : ''}`;
                },
                remove(name: string, options: any) {
                    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
                },
            },
        }
    );
}