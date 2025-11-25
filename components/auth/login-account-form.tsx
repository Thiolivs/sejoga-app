"use client"

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";

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

import { createClient } from '@/lib/supabase';
import { useRouter } from "next/navigation";

const formSchema = z.object({
    email: z.string().email({
        message: "Email inválido",
    }),
    password: z.string().min(1, {
        message: "Digite sua senha"
    })
});

// ✅ Defina a versão aqui manualmente (sincronize com build.gradle)
const APP_VERSION = "1.35";

export function LoginAccountForm() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setErrorMessage(null);
            const supabase = createClient();

            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            });

            if (error) {
                console.error("Erro ao fazer login:", error);
                
                if (error.message.includes('Invalid login credentials')) {
                    setErrorMessage('Email ou senha incorretos. Tente novamente.');
                } else if (error.message.includes('Email not confirmed')) {
                    setErrorMessage('Por favor, confirme seu email antes de fazer login.');
                } else {
                    setErrorMessage(`Erro ao fazer login: ${error.message}`);
                }
                return;
            }

            router.push("/user-app");
            router.refresh();

        } catch (error) {
            console.log("LoginAccountForm", error);
            setErrorMessage('Erro inesperado ao fazer login. Tente novamente.');
        }
    };

    return (
        <div className="flex flex-col justify-items-center text-center items-center space-y-2 max-w-md mx-auto p-6 relative">
            <span className="text-[28px] text-blue-500 font-aladin mb-8 mt-2">
                Entra, vai ter Boardgame!
            </span>

            {errorMessage && (
                <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
            )}

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col space-y-4 w-full"
                >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-mail</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
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
                                    <Input
                                        type="password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full mt-6 bg-sejoga-verde-oficial">
                        SeJoga!
                    </Button>

                    {/* ✅ Versão abaixo do botão, canto inferior direito */}
                    <div className="w-full flex justify-end">
                        <span className="text-[10px] text-gray-400">
                            v{APP_VERSION}
                        </span>
                    </div>
                </form>
            </Form>
        </div>
    );
}