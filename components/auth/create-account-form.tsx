"use client"

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

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
    password: z.string()
        .min(6, { message: "Senha deve ter no mínimo 6 caracteres" })
        .max(12, { message: "Senha deve ter no máximo 12 caracteres" })
        .regex(/[A-Z]/, { message: "Deve conter ao menos uma letra maiúscula" })
        .regex(/[0-9]/, { message: "Deve conter ao menos um número" })
        .regex(/[^A-Za-z0-9]/, { message: "Deve conter ao menos um caractere especial" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

export function CreateAccountForm() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // ✅ Observa a senha em tempo real para o indicador de requisitos
    const passwordValue = form.watch("password") || "";

    const requirements = [
        { label: "Entre 6 e 12 caracteres", met: passwordValue.length >= 6 && passwordValue.length <= 12 },
        { label: "Uma letra maiúscula", met: /[A-Z]/.test(passwordValue) },
        { label: "Um número", met: /[0-9]/.test(passwordValue) },
        { label: "Um caractere especial", met: /[^A-Za-z0-9]/.test(passwordValue) },
    ];

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
        <div className="flex flex-col justify-items-center text-center items-center space-y-2 max-w-md mx-auto p-4">
            <span className="text-[28px] text-sejoga-rosa-oficial font-marhey mb-4">
                É bem rapidinho!
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
                                    <FormLabel className="sr-only">Nome</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nome"
                                            className="pl-3 text-sm"
                                            {...field}
                                        />
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
                                    <FormLabel className="sr-only">Sobrenome</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Sobrenome"
                                            className="pl-3 text-sm"
                                            {...field}
                                        />
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
                                <FormLabel className="sr-only">E-mail</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        <Input
                                            type="email"
                                            placeholder="E-mail"
                                            className="pl-10 text-sm"
                                            {...field}
                                        />
                                    </div>
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
                                <FormLabel className="sr-only">Senha</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Senha"
                                            className="pl-10 pr-10 text-sm"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>

                                {/* ✅ Indicador de requisitos em tempo real */}
                                {passwordValue.length > 0 && (
                                    <ul className="text-xs space-y-1 mt-2 text-left">
                                        {requirements.map((req, i) => (
                                            <li
                                                key={i}
                                                className={`flex items-center gap-1.5 ${req.met ? 'text-sejoga-verde-oficial' : 'text-gray-400'}`}
                                            >
                                                <span>{req.met ? '✓' : '○'}</span>
                                                {req.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Confirmar Senha</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirmar senha"
                                            className="pl-10 pr-10 text-sm"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full mt-1 bg-sejoga-azul-oficial"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? 'Criando conta...' : 'SeJoga!'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}