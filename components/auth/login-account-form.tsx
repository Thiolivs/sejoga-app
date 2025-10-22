"use client"

import * as z from "zod";//validate form
import { zodResolver } from "@hookform/resolvers/zod"; //connect zod - react-hook-form
import { useForm } from "react-hook-form";   //control form

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Form,
    FormControl, 
    FormDescription, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage } from "@/components/ui/form";
import { tr } from "zod/locales";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    email: z.email({
        error: "Precisa ser um e-mail válido",
    }),
    password: z.string({
        error: "Esqueceu a senha, bebê?",
    }).min(6, {
        message: "A senha precisa de no mínimo 6 caracteres"
    }).max(12),
});

export function LoginAccountForm() {
    const router = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        
        try{
            const supabase = createClientComponentClient()
            const {email, password} = values;
            const {error, data: {session}} = await supabase.auth.signInWithPassword({email, password});

            form.reset()
            router.refresh()

        }catch(error){
        console.log("LoginAccountForm:onSubmit", error);

        }
        
    }

    return <div className = "flex flex-col justify-center text-center w-full space-y-4 p-6">
        <span className="text-lg mb-10 "><i>Entra, vai ter Boardgame!</i></span>
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} 
            className="flex flex-col space-y-2">

                <FormField
                    control = {form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control = {form.control}
                    name="password"
                    render={({field}) =>(
                        <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="" {...field} />
                            </FormControl>
                            {/*<FormDescription>
                                This is your Password
                            </FormDescription>*/}
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <Button type ="submit" className="flex flex-col justify-center items-center mt-5"> SeJoga! </Button>


            </form>
        </Form>
    </div>
}