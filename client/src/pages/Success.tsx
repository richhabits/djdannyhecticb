/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Instagram, Music2, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { VideoTestimonialsSection } from "@/components/VideoTestimonialsSection";

export default function Success() {
    const [location] = useLocation();
    const params = new URLSearchParams(location.split("?")[1] || "");
    const purchaseId = params.get("purchaseId");
    const bookingId = params.get("bookingId");
    const type = purchaseId ? "Purchase" : "Booking Request";

    return (
        <div className="min-h-screen pt-20">
            <div className="container max-w-4xl mx-auto py-12 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8 bg-black/40 backdrop-blur-2xl border border-green-500/20 rounded-[40px] p-12 shadow-2xl shadow-green-500/10"
                >
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
                            {type} <span className="text-gradient">Confirmed!</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            {bookingId
                                ? "Danny has generated your dynamic quote. View your breakdown and pay the deposit to lock your date immediately."
                                : "You're officially locked in. Danny will review the details and get in touch shortly to finalize the synergy."
                            }
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        {bookingId ? (
                            <Link href={`/quote/${bookingId}`}>
                                <Button size="lg" className="rounded-full px-8 bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-900/40 font-black uppercase italic tracking-widest">
                                    View Quote & Pay Deposit
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/dashboard">
                                <Button size="lg" className="rounded-full px-8 bg-white text-black hover:bg-gray-200">
                                    View My Dashboard
                                </Button>
                            </Link>
                        )}
                        <Link href="/mixes">
                            <Button size="lg" variant="outline" className="rounded-full px-8 border-white/20">
                                Listen to Latest Mixes
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Connect with the Empire</p>
                        <div className="flex justify-center gap-8">
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors"><Instagram className="w-6 h-6" /></a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors"><Music2 className="w-6 h-6" /></a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors"><Share2 className="w-6 h-6" /></a>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-24">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold uppercase tracking-widest text-muted-foreground">While You Wait...</h2>
                    </div>
                    <VideoTestimonialsSection limit={3} isFeatured />
                </div>
            </div>
        </div>
    );
}
