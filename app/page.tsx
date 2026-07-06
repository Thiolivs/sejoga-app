import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { CreateAccountForm } from "@/components/auth/create-account-form";
import { LoginAccountForm } from "@/components/auth/login-account-form"
import Image from "next/image";
import { HomeWithSplash } from "@/components/HomeWithSplash";

export default function Home() {
  // Middleware já gerencia o redirecionamento
  return (
    <HomeWithSplash>
      <div className="flex flex-col min-h-screen w-full justify-start items-center overflow-y-auto pt-5 pb-8">
        <Image
          src="/sejoga-id/MeepleColoridoNome.png"
          alt="Logo Horizontal"
          width={130}
          height={130}
          className="pb-3"
        />

        <Tabs defaultValue="login" className="w-[300px] bg-white/95 border rounded-xl pb-4 shadow-2xl">
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