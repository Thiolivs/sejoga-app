
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
import { LoginAccountForm } from "@/components/auth/login-account-form";

export default async function Home() {
  
  let loggedIn = false

  try{
    const supabase = createServerComponentClient({ cookies });
    const { data:{ session } } = await supabase.auth.getSession();
    if (session) loggedIn = true
  }
  catch(error){
    console.log("Home", error)
  }

  finally{
    if (loggedIn) redirect("/user-app", RedirectType.replace);
  }
  
return (
    <div className="flex flex-col h-screen w-full justify-center items-center">
      <Tabs defaultValue="create-account" className="w-[400px] border rounded-md pb-4 shadow-2xl">
        
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create-account">Account</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="create-account">
          <CreateAccountForm />
        </TabsContent>

        <TabsContent value="login">
          <LoginAccountForm/>
        </TabsContent>
      </Tabs>
    </div>
  )
}
