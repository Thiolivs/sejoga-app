import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { CreateAccountForm } from "@/components/auth/create-account-form";
import { LoginAccountForm } from "@/components/auth/login-account-form"
import Image from "next/image";
import { HomeWithSplash } from "@/components/HomeWithSplash"; // 👈 ADICIONE ISSO

export default async function Home() {

  let loggedIn = false

  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (session) loggedIn = true
  }
  catch (error) {
    console.log("Home", error)
  }

  finally {
    if (loggedIn) redirect("/user-app", RedirectType.replace);
  }

  return (
    <HomeWithSplash>
      <div className="flex flex-col h-screen w-full justify-center items-center">

        <Image
          src="/sejoga-id/MeepleColorido.png"
          alt="Meeple Colorido"
          width={160}
          height={160}
          className="mb-4"
        />

        <Tabs defaultValue="login" className="w-[300px] bg-white/95 border rounded-md pb-4 shadow-2xl">

          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="create-account">Criar conta</TabsTrigger>
          </TabsList>
          <TabsContent value="create-account">
            <CreateAccountForm />
          </TabsContent>

          <TabsContent value="login">
            <LoginAccountForm />
          </TabsContent>
        </Tabs>
      </div>
    </HomeWithSplash>
  )
}