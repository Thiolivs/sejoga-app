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
    firstName: z.string().min(2, {
        message: "Deve ter ao menos 2 caracteres"
    }).max(50),
    lastName: z.string().min(2, {
        message: "Deve ter ao menos 2 caracteres"
    }).max(50),
    email: z.string().email({
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
    path: ["confirmPassword"],
});

export function CreateAccountForm() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
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
            setErrorMessage(null);
            setSuccessMessage(null);
            
            const { email, password, firstName, lastName } = values;

            // Confirmação antes de criar conta
            const confirmed = window.confirm(
                `📋 Confirme seus dados:\n\n` +
                `Nome: ${firstName}\n` +
                `Sobrenome: ${lastName}\n` +
                `Email: ${email}\n\n` +
                `📧 Um email de confirmação será enviado para ${email}.\n\n` +
                `Deseja prosseguir?`
            );

            if (!confirmed) {
                return; // Usuário cancelou
            }

            const supabase = createClient();

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
                        name: `${firstName} ${lastName}`,
                    },
                },
            });

            if (error) {
                console.error("Erro ao criar conta:", error);
                
                // Mensagens de erro personalizadas
                if (error.message.includes('already registered') || error.message.includes('User already registered')) {
                    setErrorMessage('Este email já está cadastrado. Faça login ou use outro email.');
                } else if (error.message.includes('Invalid email')) {
                    setErrorMessage('Email inválido. Verifique e tente novamente.');
                } else if (error.message.includes('Password')) {
                    setErrorMessage('Senha muito fraca. Use pelo menos 6 caracteres.');
                } else {
                    setErrorMessage(`Erro ao criar conta: ${error.message}`);
                }
                return;
            }

            if (user) {
                setSuccessMessage('Conta criada com sucesso! Verifique seu email para confirmar o cadastro.');
                form.reset();
                
                setTimeout(() => {
                    router.refresh();
                    router.push("/user-app");
                }, 2000);
            }

        } catch (error) {
            console.log("CreateAccountForm", error);
            setErrorMessage('Erro inesperado ao criar conta. Tente novamente.');
        }
    };

    return (
        <div className="flex flex-col justify-items-center text-center items-center space-y-2 max-w-md mx-auto p-6">
            <span className="text-[28px] text-blue-500 font-aladin mb-8 mt-2">
                Mais rápido que uma partida de Terra Mystica
            </span>

            {/* Mensagem de erro */}
            {errorMessage && (
                <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
            )}

            {/* Mensagem de sucesso */}
            {successMessage && (
                <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600">{successMessage}</p>
                </div>
            )}

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
                                        <Input {...field} />
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
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

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

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirmar Senha</FormLabel>
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

                    <Button
                        type="submit"
                        className="w-full mt-6 bg-sejoga-verde-oficial"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? 'Criando conta...' : 'SeJoga!'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}