/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 */

import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Bell, Ticket, MapPin, ExternalLink, Shield, Activity, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function RaveIntel() {
    const [selectedCity, setSelectedCity] = useState<string>("London");
    const [selectedGenre, setSelectedGenre] = useState<string | undefined>(undefined);

    const { data: lanes } = trpc.lanes.list.useQuery();
    const { data: intel, isLoading } = trpc.raveIntel.list.useQuery({
        city: selectedCity,
        genre: selectedGenre
    }, {
        refetchInterval: 60000,
    });

    const { data: user } = trpc.users.me.useQuery();
    const saveSignal = trpc.signals.save.useMutation();
    const trackInterest = trpc.signals.trackInterest.useMutation();
    const { data: savedSignals } = trpc.signals.list.useQuery({ entityType: 'intel' }, { enabled: !!user });

    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (savedSignals) {
            setSavedIds(new Set(savedSignals.map((s: any) => s.entityId)));
        }
    }, [savedSignals]);

    useEffect(() => {
        if (user) {
            trackInterest.mutate({
                category: `${selectedCity} ${selectedGenre || 'Combined'} Lane`,
                city: selectedCity,
                metricType: "view",
                score: 1
            });
        }
    }, [user, selectedCity, selectedGenre]);

    const handleSave = (item: any) => {
        if (!user) {
            toast.error("Establish signal first.", {
                description: "Login to save intelligence to your private node.",
                action: {
                    label: "Login",
                    onClick: () => window.location.href = "/login"
                }
            });
            return;
        }

        if (savedIds.has(item.id)) return;

        saveSignal.mutate({
            entityType: 'intel',
            entityId: item.id,
            metadata: { title: item.title, category: item.category }
        }, {
            onSuccess: () => {
                setSavedIds(prev => new Set([...prev, item.id]));
                toast.success("Intelligence Intercepted", {
                    description: "Saved to your Signal Card."
                });
            }
        });
    };

    return (
        <>
            <MetaTagsComponent
                title="RAVE INTEL | THE WIRE | HECTIC EMPIRE"
                description="Real-time event intelligence. Ticket alerts, underground news, and set releases as they happen."
                url="/intel"
                type="website"
            />

            <div className="min-h-screen bg-black text-white font-sans selection:bg-accent selection:text-white pt-24 pb-48">

                {/* CINEMATIC HEADER */}
                <section className="relative py-24 border-b border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-accent/[0.03] -z-10" />
                    <div className="container relative z-10 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-3 px-6 py-2 glass-dark border border-accent/20 rounded-full"
                        >
                            <Zap className="w-4 h-4 text-accent animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Real-Time Data Overload</span>
                        </motion.div>

                        <div className="space-y-4">
                            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8]">
                                THE<br />WIRE
                            </h1>
                            <p className="text-xl text-white/40 font-medium max-w-2xl leading-relaxed">
                                Global event intelligence monitoring. We track Ticketmaster, Skiddle, and the underground nodes so you don't have to. Locked in.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-12 pt-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Status</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs font-bold">Operational</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Active Lane</span>
                                <div className="flex items-center gap-4">
                                    {['London', 'Manchester', 'Birmingham'].map(city => (
                                        <button
                                            key={city}
                                            onClick={() => setSelectedCity(city)}
                                            className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${selectedCity === city ? 'bg-orange-500 border-orange-500 text-white' : 'border-white/10 text-white/40 hover:border-orange-500/50'}`}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEED GRID */}
                <section className="container py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* MAIN INTEL FEED */}
                        <div className="lg:col-span-8 space-y-12">
                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <div key={i} className="h-64 glass-premium rounded-[3rem] animate-pulse border-white/5" />
                                    ))
                                ) : (
                                                                        intel?.map((item: any, idx: number) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group relative p-12 glass-premium rounded-[3rem] border-white/5 hover:border-accent/30 transition-all duration-500 overflow-hidden"
                                        >
                                            {/* Background Logo Overlay */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black opacity-[0.02] select-none pointer-events-none tracking-tighter">
                                                {item.category.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="relative z-10 flex flex-col md:flex-row gap-12">
                                                <div className="flex flex-col items-center gap-4 pt-1">
                                                    <div className="w-16 h-16 rounded-full glass-dark border border-white/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                                                        {item.category === 'ticket-alert' ? <Ticket className="w-8 h-8" /> : <Bell className="w-8 h-8" />}
                                                    </div>
                                                    <div className="h-full w-[1px] bg-gradient-to-b from-white/10 to-transparent flex-grow" />
                                                </div>

                                                <div className="flex-grow space-y-8">
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <Badge className="bg-accent/10 text-accent border-accent/20 font-black tracking-widest text-[10px] px-6 h-8 flex items-center">
                                                            {item.category.replace('-', ' ').toUpperCase()}
                                                        </Badge>
                                                        {item.city && (
                                                            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-black tracking-widest text-[10px] px-6 h-8 flex items-center">
                                                                {item.city.toUpperCase()} LANE
                                                            </Badge>
                                                        )}
                                                        {item.confidence && (
                                                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                                <span className="text-[9px] font-black text-white/40 uppercase">Trust: {Math.round(parseFloat(item.confidence) * 100)}%</span>
                                                            </div>
                                                        )}
                                                        <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">
                                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} GMT
                                                        </span>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none group-hover:text-accent transition-colors">
                                                            {item.title}
                                                        </h2>
                                                        <p className="text-xl text-white/60 font-medium leading-relaxed max-w-2xl">
                                                            {item.content}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-6 pt-4">
                                                                                                                {item.tags.map((tag: string) => (
                                                            <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-white/20">#{tag}</span>
                                                        ))}
                                                    </div>

                                                    <div className="pt-8 flex flex-col md:flex-row items-center justify-between border-t border-white/5 gap-8">
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-2 text-white/40">
                                                                <Shield className="w-4 h-4 text-orange-500" />
                                                                <span className="text-xs font-bold uppercase tracking-widest">{item.source} {item.sourceType === 'ticketing_api' ? 'Official API' : 'Feed'}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleSave(item)}
                                                                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${savedIds.has(item.id) ? 'text-green-500' : 'text-white/20 hover:text-accent'}`}
                                                            >
                                                                {savedIds.has(item.id) ? (
                                                                    <>
                                                                        <BookmarkCheck className="w-4 h-4" /> Intercepted
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Bookmark className="w-4 h-4" /> Save Signal
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                                                            <Button className="bg-white text-black hover:bg-accent hover:text-white transition-all duration-500 rounded-full px-12 h-16 text-lg font-black group">
                                                                SECURE ACCESS <ExternalLink className="ml-3 w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                            </Button>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* SIDEBAR: SYSTEM STATS */}
                        <div className="lg:col-span-4 space-y-12">
                            <div className="glass-premium p-12 rounded-[2.5rem] border-white/5 space-y-12">
                                <div className="flex items-center gap-4 text-accent">
                                    <Activity className="w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Network Health</h3>
                                </div>

                                <div className="space-y-8">
                                    {[
                                        { label: 'Latency', value: '42ms', progress: 85 },
                                        { label: 'Node Uptime', value: '99.9%', progress: 99 },
                                        { label: 'AI Synthesis', value: 'Active', progress: 100 },
                                    ].map(stat => (
                                        <div key={stat.label} className="space-y-3">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-white/30">{stat.label}</span>
                                                <span>{stat.value}</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${stat.progress}%` }}
                                                    className="h-full bg-accent"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-premium p-12 rounded-[2.5rem] border-white/5 space-y-12">
                                <div className="flex items-center gap-4 text-accent">
                                    <Shield className="w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Identity Protocol</h3>
                                </div>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    This data is synthesised in real-time by the Hectic Empire AI Cluster. All ticket links are verified secure via Ticketmaster, Skiddle, and O2 protocols.
                                </p>
                                <Button variant="outline" className="w-full rounded-full border-white/10 text-[10px] font-black uppercase tracking-[0.3em] h-14">
                                    Verify Identity
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* LOGO MARQUEE */}
                <section className="py-24 border-t border-white/5 overflow-hidden opacity-20">
                    <div className="flex gap-24 whitespace-nowrap font-black text-6xl uppercase tracking-tighter">
                        {[...Array(5)].map((_, i) => (
                            <span key={i}>REAL TIME INTEL • THE HECTIC WIRE • OVERRIDE ACTIVE •</span>
                        ))}
                    </div>
                </section>

            </div>
        </>
    );
}
