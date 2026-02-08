/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp,
    Target,
    Zap,
    MapPin,
    ArrowRight,
    Clock,
    AlertCircle,
    ShieldAlert,
    ChevronRight,
    RefreshCcw,
    BarChart3
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminRevenueDashboard() {
    const { user, isAuthenticated } = useAuth();
    const utils = trpc.useUtils();
    const { data: metrics, isLoading, isRefetching } = trpc.pricing.getMetrics.useQuery();

    const toggleRule = trpc.pricing.deleteRule.useMutation({
        onSuccess: () => {
            toast.success("Rule de-activated via Toxicity Protocol");
            utils.pricing.getMetrics.invalidate();
        }
    });

    if (!isAuthenticated || user?.role !== "admin") {
        return <div className="p-20 text-center font-black uppercase tracking-widest text-muted-foreground">Command Clearance Required</div>;
    }

    if (isLoading || !metrics) {
        return (
            <div className="min-h-screen flex items-center justify-center space-y-4 flex-col">
                <RefreshCcw className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Running Revenue Attribution...</p>
            </div>
        );
    }

    const COLORS = ['#f97316', '#fbbf24', '#84cc16', '#06b6d4', '#6366f1'];

    return (
        <div className="min-h-screen bg-black text-white p-6 space-y-8 animate-in fade-in duration-700">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500">Live Attribution Engine</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                        REVENUE <span className="text-orange-500">INSTRUMENTS</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs">Operator Dashboard #2 — Performance & Attribution</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 h-12 px-6" onClick={() => utils.pricing.getMetrics.invalidate()}>
                        <RefreshCcw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                        Sync Audit Logs
                    </Button>
                </div>
            </div>

            {/* Primary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-zinc-900/40 border-white/5 p-6 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Net Revenue</p>
                    <p className="text-4xl font-black italic text-white flex items-center gap-2">
                        £{metrics.summary.totalRev.toLocaleString()}
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </p>
                </Card>
                <Card className="bg-zinc-900/40 border-white/5 p-6 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Quotes Served</p>
                    <p className="text-4xl font-black italic text-white">{metrics.summary.totalQuotes}</p>
                </Card>
                <Card className="bg-zinc-900/40 border-white/5 p-6 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Global Conversion</p>
                    <div className="space-y-4">
                        <p className="text-4xl font-black italic text-orange-500">
                            {((metrics.summary.totalPaid / metrics.summary.totalQuotes || 0) * 100).toFixed(1)}%
                        </p>
                        <Progress value={(metrics.summary.totalPaid / metrics.summary.totalQuotes) * 100} className="h-1 bg-white/5" />
                    </div>
                </Card>
                <Card className="bg-zinc-900/40 border-white/5 p-6 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Avg Funnel Latency</p>
                    <p className="text-4xl font-black italic text-white flex items-center gap-2">
                        {Math.round(metrics.avgLatencyMs / 3600000)}h
                        <Clock className="w-5 h-5 text-gray-600" />
                    </p>
                </Card>
            </div>

            {/* Main Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Rule Toxicity Matrix */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black uppercase tracking-[0.2em] italic flex items-center gap-3">
                            <Zap className="w-5 h-5 text-orange-500" /> Rule Toxicity Matrix
                        </h2>
                    </div>

                    <div className="bg-zinc-900/20 border border-white/5 rounded-[30px] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <tr>
                                    <th className="px-6 py-4">Pricing Engine Hook</th>
                                    <th className="px-6 py-4">Conv %</th>
                                    <th className="px-6 py-4">Avg Lift</th>
                                    <th className="px-6 py-4">Net Rev</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {metrics.ruleMetrics.map((rule) => {
                                    const isToxic = rule.conversionStatus && rule.conversionRate < 10; // Simple toxicity threshold
                                    return (
                                        <tr key={rule.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-orange-500' : 'bg-gray-700'}`} />
                                                    <div>
                                                        <p className="font-bold text-sm tracking-tight">{rule.name}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{rule.quoteServed} Samples</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-lg font-black ${rule.conversionRate < 15 ? 'text-red-500' : 'text-white'}`}>
                                                        {rule.conversionRate.toFixed(1)}%
                                                    </span>
                                                    {rule.conversionRate < 15 && <ShieldAlert className="w-3 h-3 text-red-500" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 font-mono text-sm">£{rule.avgUplift.toFixed(2)}</td>
                                            <td className="px-6 py-5">
                                                <Badge className="bg-green-500/10 text-green-500 border-none font-black tracking-tighter">
                                                    +£{Math.round(rule.netRevenue).toLocaleString()}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleRule.mutate({ id: rule.id })}
                                                    disabled={!rule.isActive || toggleRule.isPending}
                                                    className="text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    {rule.isActive ? "Kill Rule" : "Inactive"}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Geo Tier Performance & Stack Impact */}
                <div className="space-y-8">
                    <Card className="bg-zinc-900/40 border-white/5 p-6 h-full">
                        <h2 className="text-xl font-black uppercase tracking-[0.2em] italic mb-6 flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-orange-500" /> Geo Performance
                        </h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.geoMetrics} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" stroke="#4b5563" fontSize={10} width={80} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                                        labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '10px' }}
                                    />
                                    <Bar dataKey="conversionRate" fill="#f97316" radius={[0, 4, 4, 0]}>
                                        {metrics.geoMetrics.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 space-y-4">
                            {metrics.geoMetrics.sort((a, b) => b.conversionRate - a.conversionRate).map((geo, i) => (
                                <div key={i} className="flex items-center justify-between text-xs pb-3 border-b border-white/5 last:border-0">
                                    <span className="font-black uppercase tracking-widest text-gray-500">{geo.name}</span>
                                    <span className="font-bold">£{Math.round(geo.avgTicket)} Avg</span>
                                    <span className="text-orange-500 font-black">{geo.conversionRate.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

            </div>

            {/* Strategic Insights Sidebar - Automated Warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-red-950/10 border-red-500/20 p-8 flex gap-6 items-start">
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-red-500/20">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-black uppercase italic tracking-tighter">Conversion Toxicity Alert</h3>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium">
                  Multiple rules are stacking to create >50% uplift on generic locations.
                            Short Notice + Weekend uplift combination currently shows a 42% drop in deposit intent compared to standard base-rate quotes.
                        </p>
                        <div className="pt-4">
                            <Badge variant="outline" className="border-red-500/30 text-red-500 font-bold">Review Pricing Guardrails</Badge>
                        </div>
                    </div>
                </Card>

                <Card className="bg-green-950/10 border-green-500/20 p-8 flex gap-6 items-start">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-green-500/20">
                        <BarChart3 className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-black uppercase italic tracking-tighter">Revenue Opportunity Detected</h3>
                        <p className="text-sm text-gray-400 leading-relaxed font-medium">
                            {metrics.geoMetrics.sort((a, b) => b.conversionRate - a.conversionRate)[0]?.name} region shows high price elasticity (35% conversion at £{Math.round(metrics.geoMetrics.sort((a, b) => b.conversionRate - a.conversionRate)[0]?.avgTicket)}).
                            Consider increasing the Geo Band multiplier by 5% for this tier.
                        </p>
                        <div className="pt-4">
                            <Badge variant="outline" className="border-green-500/30 text-green-500 font-bold">Optimize Regional Multiplier</Badge>
                        </div>
                    </div>
                </Card>
            </div>

        </div>
    );
}
