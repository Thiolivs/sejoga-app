"use client"

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Form,
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from "@/components/ui/form";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    email: z.string().email({
        message: "Precisa ser um e-mail válido",
    }),
    password: z.string()
        .min(6, {
            message: "A senha precisa de no mínimo 6 caracteres"
        })
        .max(12, {
            message: "A senha pode ter no máximo 12 caracteres"
        }),
});

export function LoginAccountForm() {
    const router = useRouter();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const { email, password } = values;
            
            const { error, data } = await supabase.auth.signInWithPassword({
                email, 
                password
            });

            if (error) {
                console.error("Erro no login:", error);
                form.setError("password", {
                    message: "E-mail ou senha incorretos"
                });
                return;
            }

            console.log("✅ Login bem-sucedido:", data.user?.email);
            
            form.reset();
            router.push('/user-app');
            router.refresh();

        } catch (error) {
            console.error("LoginAccountForm:onSubmit", error);
            form.setError("password", {
                message: "Erro ao fazer login. Tente novamente."
            });
        }
    }

    return (
        <div className="flex flex-col justify-center text-center pl-6 pb-6 pr-6 pt-3">
            <span className="text-lg font mb-6"><i>Entra, vai ter Boardgame!</i></span>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-2">
                    <FormField
                        control={form.control}
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
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <Button 
                        type="submit" 
                        className="flex flex-col bg-sejoga-azul-oficial justify-center items-center mt-5"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? 'Entrando...' : 'SeJoga!'}
                    </Button>
                </form>
            </Form>
        </div>
    )
}