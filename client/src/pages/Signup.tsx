/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const registerMutation = trpc.auth.register.useMutation({
        onSuccess: () => {
            toast.success("Account created! Please log in.");
            window.location.href = "/login";
        },
        onError: (error) => {
            toast.error(error.message || "Registration failed");
        }
    });

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate({ email, password, name });
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gradient-to-br from-orange-900/10 via-background to-amber-900/10 -z-10" />

            <div className="w-full max-w-md">
                <Link href="/" className="flex items-center justify-center gap-3 mb-8 hover:opacity-80 smooth-transition">
                    <Music className="w-10 h-10 text-accent" />
                    <span className="text-2xl font-bold">DJ Danny Hectic B</span>
                </Link>

                <Card className="p-8 glass hover-lift">
                    <h2 className="text-2xl font-bold mb-2 text-center">Create Account</h2>
                    <p className="text-center text-muted-foreground mb-6">Join the community</p>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Name"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent smooth-transition"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent smooth-transition"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    className="w-full pl-10 pr-12 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent smooth-transition"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground smooth-transition"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="w-full gradient-bg py-6 text-lg font-semibold hover-lift"
                        >
                            {registerMutation.isPending ? "Creating Account..." : "Sign Up"}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Already have an account?{" "}
                        <Link href="/login" className="text-accent font-semibold hover:underline">
                            Log In
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
}
