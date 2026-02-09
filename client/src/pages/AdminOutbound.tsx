/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Users,
    Search,
    ExternalLink,
    Mail,
    TrendingUp,
    Zap,
    CheckCircle2,
    AlertCircle,
    PlusCircle,
    Copy,
    ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminOutbound() {
    const [filter, setFilter] = useState<any>({});
    const { data: leads, isLoading, refetch } = trpc.outbound.listLeads.useQuery(filter);
    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
    const { data: leadDetails } = trpc.outbound.getLead.useQuery({ id: selectedLeadId || 0 }, { enabled: !!selectedLeadId });

    const outreachGen = trpc.outbound.generateOutreach.useMutation({
        onSuccess: (data) => {
            toast.success("Outreach package generated with indicative quote.");
        }
    });

    const createLead = trpc.outbound.createLead.useMutation({
        onSuccess: () => {
            toast.success("New lead captured and scored.");
            refetch();
        }
    });

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-20">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Outbound Lead Engine</span>
                        </div>
                        <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
                            LEAD <span className="text-orange-500">CAPTURE</span>
                        </h1>
                        <p className="text-gray-500 mt-4 font-bold uppercase tracking-widest text-xs">Signal-Driven Growth Without Ads</p>
                    </div>
                    <Button className="h-14 px-8 bg-white text-black hover:bg-gray-200 font-bold rounded-2xl">
                        <PlusCircle className="w-5 h-5 mr-2" /> Manual Lead Capture
                    </Button>
                </div>

                {/* Lead Command Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Active Leads List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black uppercase tracking-[0.2em] italic flex items-center gap-3">
                                <Search className="w-5 h-5 text-orange-500" /> Live Feed
                            </h2>
                            <div className="flex gap-2">
                                {["new", "qualified", "contacted"].map((s) => (
                                    <Button
                                        key={s}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setFilter({ status: s })}
                                        className={`text-[10px] font-black uppercase tracking-widest ${filter.status === s ? 'bg-white/10' : ''}`}
                                    >
                                        {s}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {isLoading ? (
                                <div className="p-20 text-center animate-pulse text-gray-500 uppercase font-black tracking-widest">Scanning Signal Sources...</div>
                            ) : leads?.map((lead) => (
                                <Card
                                    key={lead.id}
                                    onClick={() => setSelectedLeadId(lead.id)}
                                    className={`bg-zinc-900/40 border-white/5 transition-all cursor-pointer hover:border-orange-500/30 ${selectedLeadId === lead.id ? 'border-orange-500/50 bg-orange-500/5' : ''}`}
                                >
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-orange-500 border border-white/5">
                                                {lead.leadScore}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight">{lead.organisation || lead.name || "Anonymous Lead"}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <Badge variant="outline" className="text-[10px] font-black uppercase border-white/10 text-gray-500">
                                                        {lead.source}
                                                    </Badge>
                                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                                        {lead.geoContext || "Unknown Location"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-[10px] font-black uppercase text-gray-600">
                                                {format(new Date(lead.createdAt), "MMM d")}
                                            </p>
                                            <ChevronRight className="w-4 h-4 text-gray-700" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Lead Intelligence Panel */}
                    <div className="lg:col-span-1">
                        {leadDetails ? (
                            <div className="space-y-6 sticky top-24">
                                <Card className="bg-zinc-900 border-orange-500/20 shadow-2xl overflow-hidden">
                                    <div className="p-8 space-y-8">
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">Lead Intelligence</h3>
                                            <h2 className="text-3xl font-black italic tracking-tighter uppercase">{leadDetails.organisation || leadDetails.name}</h2>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Lead Score</p>
                                                <p className="text-2xl font-black italic text-white">{leadDetails.leadScore}</p>
                                            </div>
                                            <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Source</p>
                                                <p className="text-xs font-black uppercase text-orange-500">{leadDetails.source}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Button
                                                onClick={() => outreachGen.mutate({ id: leadDetails.id })}
                                                disabled={outreachGen.isPending}
                                                className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest italic rounded-2xl"
                                            >
                                                {outreachGen.isPending ? "Calculating Quote..." : "Generate Quote-First Package"}
                                            </Button>
                                            <Button variant="outline" className="w-full h-12 border-white/10 font-bold uppercase text-[10px] tracking-widest rounded-xl">
                                                Log Manual Interaction
                                            </Button>
                                        </div>

                                        {outreachGen.data && (
                                            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Generated Pitch</p>
                                                        <Button variant="ghost" size="sm" onClick={() => {
                                                            navigator.clipboard.writeText(outreachGen.data.message);
                                                            toast.success("Pitch copied to clipboard");
                                                        }}>
                                                            <Copy className="w-3 h-3 h-3 mr-2" /> Copy
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm text-gray-300 leading-relaxed font-medium whitespace-pre-wrap italic">
                                                        {outreachGen.data.message}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 text-green-500">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Indicative Quote Linked: £{outreachGen.data.quote.total}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-8 border-t border-white/5">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Interaction History</h4>
                                            <div className="space-y-4">
                                                {leadDetails.interactions?.length > 0 ? leadDetails.interactions.map((i: any) => (
                                                    <div key={i.id} className="flex gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                                            <Zap className="w-3 h-3 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold uppercase">{i.type}</p>
                                                            <p className="text-[10px] text-gray-500">{format(new Date(i.createdAt), "MMM d, HH:mm")}</p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <p className="text-[10px] font-bold text-gray-600 uppercase italic">No contact attempts recorded.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Automation Warning */}
                                <div className="bg-orange-950/10 border border-orange-500/20 rounded-[30px] p-6 flex gap-4 items-start">
                                    <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                                    <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed tracking-widest">
                                        This lead is high signal. Respond manually to guarantee conversion.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[600px] flex items-center justify-center border border-dashed border-white/5 rounded-[40px] text-gray-700 uppercase font-black text-xs tracking-[0.4em]">
                                Select a signal to inspect
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}

import { ChevronRight } from "lucide-react";
