"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomInput from "./CustomInput";
import { authFormSchema } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Nanum_Brush_Script } from "next/font/google";

function AuthForm({ type }: { type: string }) {
    const formSchema = authFormSchema(type);

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            username: "",
            password: "",
        },
    });

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsLoading(true);
        console.log(values);
        setIsLoading(false);
    }

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <section className="auth-form ">
            <header className="gap-5 flex flex-col md:gap-8">
                <Link
                    href="/"
                    className="flex cursor-pointer items-center gap-1"
                >
                    <Image
                        src="/icons/logo.svg"
                        width={34}
                        height={34}
                        alt="horizon logo"
                    />
                    <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
                        Horizon
                    </h1>
                </Link>
                <div className="flex flex-col gap-1 md:gap-3">
                    <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
                        {user
                            ? "Link Account"
                            : type === "sign-in"
                            ? "Sign In"
                            : "Sign Up"}
                    </h1>
                    <p className="text-16 font-normal text-gray-600">
                        {user
                            ? "Link your account to get started"
                            : "Enter your details"}
                    </p>
                </div>
            </header>
            {user ? (
                <div className="flex flex-col gap-4">Plaidlink</div>
            ) : (
                <>
                    <Form {...form}>
                        {type === "sign-up" && (
                            <>
                                <div className="flex gap-4">
                                    <CustomInput
                                        control={form.control}
                                        label="First Name"
                                        name="firstname"
                                        type="text"
                                        placeholder="First Name"
                                    />
                                    <CustomInput
                                        control={form.control}
                                        label="Last Name"
                                        name="lastname"
                                        type="text"
                                        placeholder="Last Name"
                                    />
                                </div>
                                <CustomInput
                                    control={form.control}
                                    label="Address"
                                    name="address1"
                                    type="text"
                                    placeholder="Enter your address"
                                />
                                <div className="flex gap-4">
                                    <CustomInput
                                        control={form.control}
                                        label="City"
                                        name="state"
                                        type="text"
                                        placeholder="ex: NY"
                                    />
                                    <CustomInput
                                        control={form.control}
                                        label="Postal Code"
                                        name="postalCode"
                                        type="text"
                                        placeholder="ex: 00100"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <CustomInput
                                        control={form.control}
                                        label="Date of Birth"
                                        name="dateOfBirth"
                                        type="date"
                                        placeholder="dd-mm-yyyy"
                                    />
                                    <CustomInput
                                        control={form.control}
                                        label="ID Number"
                                        name="idNumber"
                                        type="text"
                                        placeholder="ID No."
                                    />
                                </div>
                            </>
                        )}
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8"
                        >
                            <CustomInput
                                control={form.control}
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="Email"
                            />
                            <CustomInput
                                control={form.control}
                                label="Username"
                                name="username"
                                type="text"
                                placeholder="Username"
                            />
                            <CustomInput
                                control={form.control}
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="Password"
                            />
                            <div className="flex flex-col gap-4">
                                <Button className="form-btn" type="submit">
                                    {isLoading ? (
                                        <>
                                            <Loader2
                                                size={20}
                                                className="animate-spin"
                                            />
                                            &nbsp; Loading...
                                        </>
                                    ) : type === "sign-in" ? (
                                        "Sign In"
                                    ) : (
                                        "Sign Up"
                                    )}
                                </Button>
                            </div>
                        </form>
                        <footer className="flex justify-center gap-1">
                            <p className="text-14 font-normal text-gray-600">
                                {type === "sign-in"
                                    ? "Don't have an account?"
                                    : "Already have an account?"}
                            </p>
                            <Link
                                className="form-link"
                                href={
                                    type === "sign-in" ? "/sign-up" : "/sign-in"
                                }
                            >
                                {type === "sign-in" ? "Sign Up" : "Sign In"}
                            </Link>
                        </footer>
                    </Form>
                </>
            )}
        </section>
    );
}

export default AuthForm;
