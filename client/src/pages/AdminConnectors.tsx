/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 */

import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Link2, Shield, Settings, Activity, Terminal, Key } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminConnectors() {
    const { data: connectors, refetch } = trpc.admin.ingestion.connectors.useQuery();
    const { data: logs } = trpc.admin.ingestion.syncLogs.useQuery({});
    const runSync = trpc.admin.ingestion.runSync.useMutation();
    const setKey = trpc.admin.ingestion.setKey.useMutation();

    const [editingConnector, setEditingConnector] = useState<number | null>(null);
    const [apiKey, setApiKey] = useState("");

    const handleRunSync = () => {
        toast.promise(runSync.mutateAsync(), {
            loading: "Initiating Global Sync...",
            success: "Network Synchronization Started",
            error: "Sync Protocol Failed"
        });
    };

    const handleUpdateKey = (id: number) => {
        setKey.mutate({
            connectorId: id,
            keyName: 'apiKey',
            keyValue: apiKey
        }, {
            onSuccess: () => {
                toast.success("Security Key Locked", {
                    description: "Encrypted and persisted to governance node."
                });
                setEditingConnector(null);
                setApiKey("");
            }
        });
    };

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-48 font-sans">
            <div className="container space-y-12">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Link2 className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Ingestion Protocols</span>
                        </div>
                        <h1 className="text-6xl font-black uppercase tracking-tighter">Connectors</h1>
                        <p className="text-white/40 max-w-xl font-medium">Manage regional intelligence feeders. Implement secure API bridges and monitor sync telemetry.</p>
                    </div>

                    <Button
                        onClick={handleRunSync}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-12 h-16 text-lg font-black"
                    >
                        SYNC ALL LANES <Activity className="ml-3 w-5 h-5 animate-pulse" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* ACTIVE CONNECTORS */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {connectors?.map(conn => (
                            <Card key={conn.id} className="p-8 bg-white/[0.02] border-white/5 rounded-[2.5rem] space-y-8 group hover:border-orange-500/30 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                        <Settings className="w-6 h-6" />
                                    </div>
                                    <Badge className={`${conn.isEnabled ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} border-none uppercase text-[9px] font-black px-4`}>
                                        {conn.isEnabled ? 'Active' : 'Offline'}
                                    </Badge>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{conn.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-2">{conn.type} Provider</p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                                        <span>Last Sync</span>
                                        <span>{conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleTimeString() : 'Never'}</span>
                                    </div>

                                    {editingConnector === conn.id ? (
                                        <div className="space-y-3">
                                            <Input
                                                type="password"
                                                placeholder="Enter API Key"
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                className="bg-black border-white/10 rounded-xl h-12 text-sm"
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleUpdateKey(conn.id)} className="bg-orange-500 rounded-xl flex-grow">Secure Key</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingConnector(null)}>Cancel</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() => setEditingConnector(conn.id)}
                                            className="w-full border-white/10 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <Key className="w-3 h-3 mr-2" /> Update Security Key
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* SYNC LOGS TERMINAL */}
                    <Card className="lg:col-span-12 p-12 bg-white/[0.02] border-white/5 rounded-[3rem] space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Terminal className="w-5 h-5 text-green-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Global Ingestion Stream</h3>
                            </div>
                            <Badge variant="outline" className="opacity-40 text-[10px] font-black uppercase">Live Logs</Badge>
                        </div>

                        <div className="bg-black/50 rounded-2xl p-8 font-mono text-[11px] space-y-2 max-h-96 overflow-y-auto border border-white/5">
                            {logs?.map(log => (
                                <div key={log.id} className="flex gap-4">
                                    <span className="text-white/20">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                                    <span className={log.status === 'success' ? 'text-green-500' : 'text-red-500'}>
                                        {log.status.toUpperCase()}
                                    </span>
                                    <span className="text-white/40">— Connector #{log.connectorId}:</span>
                                    <span className="text-white/80">
                                        {log.status === 'success'
                                            ? `Ingested ${log.itemsIngested} items in ${log.durationMs}ms`
                                            : log.errorMessage}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
