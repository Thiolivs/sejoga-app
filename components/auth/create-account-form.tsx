"use client"

import * as z from "zod";//validate form
import { zodResolver } from "@hookform/resolvers/zod"; //connect zod - react-hook-form
import { useForm } from "react-hook-form";   //control form

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { 
    Form,
    FormControl, 
    FormDescription, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage } from "@/components/ui/form";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    email: z.email({
        error: "Must be a valid email",
    }),
    password: z.string({
        error: "Password is required",
    }).min(7, {
        message: "Password must have a minimum 7 characters"
    }).max(12),
});

export function CreateAccountForm() {
    const router = useRouter()
    const form = useForm <z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{

            const supabase = createClientComponentClient();
            const {email, password} = values;            
            const {
                error, 
                data: {user}, 
            } = await supabase.auth.signUp({
                email,
                password,
                // options: {
                //     emailRedirectTo: `${location.origin}/auth/callback`,
                // },
            });

            if (user) {
                form.reset();
                router.refresh();
                //router.push("/");
            }

        }catch(error){
            console.log("CreateAccountForm", error)
        }
    }

    return <div className = "flex flex-col justify-center items-center space-y-2">
        <span className="text-lg">Create account</span>
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
                                <Input placeholder="E-mail" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your E-mail
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control = {form.control}
                    name="password"
                    render={({field}) =>(
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type = "password" placeholder="Password" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your Password
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <Button type ="submit"> Create Account</Button>


            </form>
        </Form>
    </div>
}