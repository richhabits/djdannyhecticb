/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";

export default function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [location] = useLocation();
    const queryParams = new URLSearchParams(location.split("?")[1]);
    const refCode = queryParams.get("ref");

    // Note: invites.redeem router temporarily disabled
    // const redeemInvite = trpc.invites.redeem.useMutation();

    const registerMutation = trpc.auth.register.useMutation({
        onSuccess: async () => {
            if (refCode) {
                // Invite redemption temporarily disabled
                toast.success("Welcome! Invite system will be available soon.");
            }
            toast.success("Signal Established. Welcome to the Empire.");
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
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
            {/* Cinematic Background */}
            <div className="absolute inset-0 bg-[#0a0a0b] -z-10" />
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-12">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 smooth-transition">
                        <Music className="w-10 h-10 text-orange-500" />
                        <span className="text-2xl font-bold tracking-tighter">HECTIC EMPIRE</span>
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Create New Signal</h1>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium opacity-70">UK Underground Access Node</p>

                    {refCode && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full"
                        >
                            <ShieldCheck className="w-3 h-3 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">London Lane invite active</span>
                        </motion.div>
                    )}
                </div>

                <Card className="p-8 border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Handle Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. RaveMaster99"
                                    className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 smooth-transition text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Identity (Email)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 smooth-transition text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Encryption Key</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    className="w-full pl-10 pr-12 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 smooth-transition text-sm"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground smooth-transition"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-xl font-bold group smooth-transition"
                        >
                            {registerMutation.isPending ? "Generating Node..." : (
                                <span className="flex items-center gap-2">
                                    Establish Signal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 smooth-transition" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-sm text-muted-foreground">
                            Already tracked?{" "}
                            <Link href="/login" className="text-orange-500 font-bold hover:underline">
                                Log In
                            </Link>
                        </p>
                    </div>
                </Card>

                {/* Footer Meta */}
                <div className="mt-8 flex justify-center gap-6 text-[10px] uppercase tracking-widest text-muted-foreground/50">
                    <span>© 2026 HECTIC EMPIRE</span>
                    <Link href="/rules" className="hover:text-white smooth-transition">Rules of the Scene</Link>
                </div>
            </motion.div>
        </div>
    );
}
