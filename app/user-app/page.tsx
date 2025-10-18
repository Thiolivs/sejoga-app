import { UserNav } from "@/components/common/user-nav";
import { UserAppContent } from "@/components/UserAppContent";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

export default async function UserApp() {
    let loggedIn = false;
    let userEmail = "";

    try {
        const supabase = createServerComponentClient({ cookies });
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (session) {
            loggedIn = true;
            userEmail = session.user.email || "";
        }
    } catch (error) {
        console.log("UserApp", error);
    } finally {
        if (!loggedIn) redirect("/", RedirectType.replace);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header com UserNav */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">SeJoga no App!</h1>
                        <UserNav />
                    </div>
                </div>
            </header>

            {/* Conteúdo com abas (Client Component) */}
            <UserAppContent userEmail={userEmail} />
        </div>
    );
}