import { UserNav } from "@/components/common/user-nav";
import { UserAppContent } from "@/components/UserAppContent";
import { UserAppHeader } from "@/components/UserAppHeader"; // 👈 ADICIONE
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
        <div className="min-h-screen">
            {/* Header com Menu e UserNav */}
            <UserAppHeader /> {/* 👈 USE O COMPONENTE */}

            {/* Conteúdo com abas (Client Component) */}
            <UserAppContent userEmail={userEmail} />
        </div>
    );
}