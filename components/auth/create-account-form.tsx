"use client"

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { 
    Form,
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from "@/components/ui/form";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    firstName: z.string().min(2, {
        message: "Nome deve ter pelo menos 2 caracteres"
    }).max(50),
    lastName: z.string().min(2, {
        message: "Sobrenome deve ter pelo menos 2 caracteres"
    }).max(50),
    email: z.email({
        message: "Email inválido",
    }),
    password: z.string().min(6, {
        message: "Senha deve ter no mínimo 6 caracteres"
    }).max(12, {
        message: "Senha deve ter no máximo 12 caracteres"
    }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"], // Mostra o erro no campo confirmPassword
});

export function CreateAccountForm() {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const supabase = createClientComponentClient();
            const { email, password, firstName, lastName } = values;
            
            const {
                error, 
                data: { user }, 
            } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        name: `${firstName} ${lastName}`, // Full name
                    },
                },
            });

            if (error) {
                console.error("Erro ao criar conta:", error);
                alert(`Erro: ${error.message}`);
                return;
            }

            if (user) {
                alert("Conta criada com sucesso! ✅");
                form.reset();
                router.refresh();
                router.push("/user-app");
            }

        } catch (error) {
            console.log("CreateAccountForm", error);
            alert("Erro ao criar conta. Tente novamente.");
        }
    };

    return (
        <div className="flex flex-col justify-items-center text-center items-center space-y-2 max-w-md mx-auto p-6">
            <span className="text-lg mb-10">
                <i>Mais rápido que uma partida de Terra Mystica</i>
            </span>
            <Form {...form}>
                <form 
                    onSubmit={form.handleSubmit(onSubmit)} 
                    className="flex flex-col space-y-4 w-full"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Seu nome" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sobrenome</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Sobrenome" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-mail</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="email"
                                        placeholder="Digite seu email" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Senha */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="password" 
                                        placeholder="Digite a senha" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Confirmar Senha */}
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirmar Senha</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="password" 
                                        placeholder="Digite a senha novamente" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button 
                        type="submit" 
                        className="w-full mt-6"
                    >
                        SeJoga!
                    </Button>
                </form>
            </Form>
        </div>
    );
}