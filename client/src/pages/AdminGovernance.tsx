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
    ShieldAlert,
    ShieldCheck,
    Activity,
    History,
    Trash2,
    Zap,
    RefreshCcw,
    AlertTriangle,
    Lock,
    Unlock,
    History as HistoryIcon
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminGovernance() {
    const [killReason, setKillReason] = useState("");
    const utils = trpc.useUtils();
    const { data: govStatus, isLoading, isRefetching } = trpc.pricing.getGovernanceStatus.useQuery();

    const toggleKillSwitch = trpc.pricing.toggleKillSwitch.useMutation({
        onSuccess: () => {
            toast.success("Governance State Transitioned.");
            setKillReason("");
            utils.pricing.getGovernanceStatus.invalidate();
        },
        onError: (err: Error) => {
            toast.error(`Transition Failed: ${err.message}`);
        }
    });

    const runHygiene = trpc.pricing.runHygiene.useMutation({
        onSuccess: (data: any) => {
            toast.success(`Hygiene scan complete. Released ${data.expiredCount} dates.`);
        }
    });

    const resolveIncident = trpc.pricing.resolveIncident.useMutation({
        onSuccess: () => {
            toast.success("Incident archived. System health signal restored.");
            utils.pricing.getGovernanceStatus.invalidate();
        }
    });

    if (isLoading || !govStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
                    <p className="font-black uppercase tracking-[0.4em] text-muted-foreground">Connecting to Governance Layer...</p>
                </div>
            </div>
        );
    }

    const isLocked = !govStatus.isOperational;

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-20">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className={`w-4 h-4 ${isLocked ? 'text-red-500' : 'text-blue-500'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isLocked ? 'text-red-500' : 'text-blue-500'}`}>
                                {isLocked ? "System Lockdown Active" : "Governance Normal"}
                            </span>
                        </div>
                        <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
                            SYSTEM <span className={isLocked ? "text-red-500" : "text-blue-500"}>GOVERNANCE</span>
                        </h1>
                        <p className="text-gray-500 mt-4 font-bold uppercase tracking-widest text-xs italic">Operator Fail-Safe & Inventory Hygiene</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="h-14 border-white/10 hover:bg-white/5" onClick={() => utils.pricing.getGovernanceStatus.invalidate()}>
                            <RefreshCcw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Status Overview cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="bg-zinc-900/40 border-white/5 p-8 flex flex-col gap-4">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">Revenue Status</p>
                        {isLocked ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-red-500">
                                    <Lock className="w-8 h-8" />
                                    <span className="text-2xl font-black italic tracking-tighter">LOCKED</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">No New Quotes or Deposits</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-blue-500">
                                    <Unlock className="w-8 h-8" />
                                    <span className="text-2xl font-black italic tracking-tighter">OPERATIONAL</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Full Revenue Stack Active</p>
                            </div>
                        )}
                    </Card>

                    <Card className="bg-zinc-900/40 border-white/5 p-8 flex flex-col gap-4">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">Active Incidents</p>
                        <p className={`text-5xl font-black italic tracking-tighter ${govStatus.incidents.length > 0 ? 'text-orange-500' : 'text-gray-700'}`}>
                            {govStatus.incidents.length.toString().padStart(2, '0')}
                        </p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">System-level anomalies</p>
                    </Card>

                    <Card className="bg-zinc-900/40 border-white/5 p-8 flex flex-col gap-4">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">Security Posture</p>
                        <div className="flex items-center gap-3 text-green-500">
                            <ShieldCheck className="w-8 h-8" />
                            <span className="text-2xl font-black italic tracking-tighter">HARDENED</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Blast-radius controls active</p>
                    </Card>
                </div>

                {/* Main Controls Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Emergency Kill-Switch */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-black uppercase tracking-[0.2em] italic flex items-center gap-3">
                            <Lock className="w-5 h-5 text-red-500" /> Emergency Kill-Switch
                        </h2>
                        <Card className="bg-zinc-900 border-red-500/20 overflow-hidden">
                            <CardContent className="p-8 space-y-6">
                                <p className="text-sm font-medium text-gray-400 leading-relaxed">
                                    Activating the Kill-Switch immediately suspends all quote generation and deposit payments. Use this in the event of pricing drift, inventory deadlocks, or manual security overrides.
                                </p>

                                <div className="space-y-4">
                                    <Input
                                        placeholder="Authorized reason for state transition..."
                                        className="bg-black/40 border-white/10 h-14"
                                        value={killReason}
                                        onChange={(e) => setKillReason(e.target.value)}
                                    />
                                    <Button
                                        disabled={!killReason || toggleKillSwitch.isPending}
                                        onClick={() => toggleKillSwitch.mutate({ active: !isLocked, reason: killReason })}
                                        className={`w-full h-16 text-lg font-black uppercase italic tracking-widest rounded-2xl ${isLocked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                                    >
                                        {isLocked ? "DE-ACTIVATE LOCKDOWN" : "ACTIVATE LOCKDOWN"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hygiene Trigger */}
                        <h2 className="text-xl font-black uppercase tracking-[0.2em] italic flex items-center gap-3 pt-6">
                            <RefreshCcw className="w-5 h-5 text-blue-500" /> Operational Hygiene
                        </h2>
                        <Card className="bg-zinc-900 border-white/5 overflow-hidden">
                            <CardContent className="p-8 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg">Deposit TTL Cleanup</h3>
                                    <p className="text-xs text-gray-500 mt-1 font-medium">Releases inventory from expired/unpaid pending bookings.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => runHygiene.mutate()}
                                    disabled={runHygiene.isPending}
                                    className="border-white/10 hover:bg-white/5 h-12 px-6 font-black uppercase text-[10px] tracking-widest"
                                >
                                    Trigger Scan
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Governance Incident History */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-black uppercase tracking-[0.2em] italic flex items-center gap-3">
                            <HistoryIcon className="w-5 h-5 text-gray-500" /> Fail-Safe History
                        </h2>

                        {govStatus.incidents.length > 0 && (
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Active System Anomalies</p>
                                {govStatus.incidents.map((incident: any) => (
                                    <Card key={incident.id} className="bg-orange-500/5 border-orange-500/20 p-6 flex justify-between items-center">
                                        <div className="flex gap-4">
                                            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
                                            <div>
                                                <p className="font-bold text-sm">{incident.message}</p>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">{incident.type} — {format(new Date(incident.createdAt), "HH:mm:ss")}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => resolveIncident.mutate({ id: incident.id })} className="text-[10px] font-black uppercase tracking-widest hover:bg-orange-500/10 hover:text-orange-500">
                                            Resolve
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="bg-zinc-900/20 border border-white/5 rounded-[30px] overflow-hidden">
                            <div className="p-6 border-b border-white/5 bg-white/5">
                                <p className="text-[10px] font-black uppercase tracking-tighter text-gray-500">Immutable Governance Log</p>
                            </div>
                            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                                {govStatus.latestLogs.map((log: any) => (
                                    <div key={log.id} className="p-6 flex items-start justify-between group hover:bg-white/[0.02]">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase tracking-widest text-white group-hover:text-blue-500 transition-colors">{log.action}</p>
                                            <p className="text-[10px] text-gray-500 font-medium italic">"{log.reason}"</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">{format(new Date(log.createdAt), "MMM d, HH:mm")}</p>
                                        </div>
                                    </div>
                                ))}
                                {govStatus.latestLogs.length === 0 && (
                                    <div className="p-12 text-center text-gray-700 uppercase font-black tracking-widest text-[10px]">No Governance Actions Recorded.</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
