/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Calendar, MapPin, Zap, TrendingUp, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminPricing() {
    const { user, isAuthenticated } = useAuth();
    const utils = trpc.useUtils();
    const { data: rules, isLoading } = trpc.pricing.getRules.useQuery();

    const [newRule, setNewRule] = useState({
        ruleType: "base_rate" as any,
        ruleValue: 0,
        ruleStrategy: "fixed" as any,
    });

    const createMutation = trpc.pricing.createRule.useMutation({
        onSuccess: () => {
            toast.success("Pricing rule added to engine");
            utils.pricing.getRules.invalidate();
        },
        onError: (err: Error) => toast.error(err.message)
    });

    const deleteMutation = trpc.pricing.deleteRule.useMutation({
        onSuccess: () => {
            toast.success("Rule deactivated");
            utils.pricing.getRules.invalidate();
        }
    });

    if (!isAuthenticated || user?.role !== "admin") {
        return <div className="p-20 text-center font-black uppercase tracking-widest text-muted-foreground">Command Clearance Required</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                        <Settings2 className="h-8 w-8 text-orange-500" />
                        Revenue <span className="text-orange-500">Optimization</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Manage dynamic pricing rules and automated quote logic
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rule Creator */}
                <Card className="lg:col-span-1 border-orange-500/20 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full -mr-16 -mt-16 transition-all group-hover:bg-orange-500/20" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 uppercase tracking-tighter italic">
                            <Zap className="w-5 h-5 text-orange-500" /> New Rule Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Logic Type</Label>
                            <Select value={newRule.ruleType} onValueChange={(v) => setNewRule({ ...newRule, ruleType: v as any })}>
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="base_rate">Base Rate (Performance Fee)</SelectItem>
                                    <SelectItem value="weekend_uplift">Weekend Uplift (Fri-Sun)</SelectItem>
                                    <SelectItem value="short_notice">Rapid Deployment (&lt;14 Days)</SelectItem>
                                    <SelectItem value="location_band">Premium City Uplift</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Value</Label>
                                <Input
                                    type="number"
                                    value={newRule.ruleValue}
                                    onChange={(e) => setNewRule({ ...newRule, ruleValue: parseFloat(e.target.value) })}
                                    className="bg-background/50 font-mono text-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Strategy</Label>
                                <Select value={newRule.ruleStrategy} onValueChange={(v) => setNewRule({ ...newRule, ruleStrategy: v as any })}>
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fixed (£)</SelectItem>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest italic h-12 shadow-lg shadow-orange-900/20"
                            onClick={() => createMutation.mutate(newRule)}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? "Syncing..." : "Enable Rule"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Active Rules List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black uppercase tracking-[0.2em] text-muted-foreground italic">Live Engine Hooks</h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            Processing Active
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-20 text-center text-muted-foreground uppercase font-black tracking-widest animate-pulse border-2 border-dashed border-border/40 rounded-3xl">
                            Analyzing Revenue Streams...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {rules?.map((rule: any) => (
                                <Card key={rule.id} className="bg-card/40 border-border/50 hover:border-orange-500/40 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                                            onClick={() => { if (confirm("Deactivate this pricing hook?")) deleteMutation.mutate({ id: rule.id }) }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <CardContent className="p-6 flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
                                            {rule.ruleType === "weekend_uplift" && <Calendar className="w-6 h-6 text-orange-500" />}
                                            {rule.ruleType === "base_rate" && <TrendingUp className="w-6 h-6 text-orange-400" />}
                                            {rule.ruleType === "location_band" && <MapPin className="w-6 h-6 text-orange-600" />}
                                            {rule.ruleType === "short_notice" && <Zap className="w-6 h-6 text-amber-500" />}
                                        </div>
                                        <div>
                                            <h4 className="font-black uppercase tracking-tighter text-xs text-muted-foreground flex items-center gap-2">
                                                {rule.ruleType.replace("_", " ")}
                                                {rule.ruleStrategy === "percentage" && <span className="bg-orange-500/10 text-orange-500 px-1.5 rounded text-[10px]">REL</span>}
                                            </h4>
                                            <p className="text-3xl font-black italic tracking-tighter uppercase leading-none mt-1">
                                                {rule.ruleStrategy === "fixed" ? `£${rule.ruleValue}` : `${rule.ruleValue}%`}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {rules?.length === 0 && (
                                <div className="md:col-span-2 p-12 text-center border-2 border-dashed border-border/40 rounded-3xl space-y-4">
                                    <Settings2 className="w-10 h-10 text-muted-foreground mx-auto opacity-20" />
                                    <div>
                                        <p className="font-bold text-muted-foreground uppercase tracking-widest">No Rules Detected</p>
                                        <p className="text-xs text-muted-foreground mt-1">The engine is currently running on legacy fallbacks.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
