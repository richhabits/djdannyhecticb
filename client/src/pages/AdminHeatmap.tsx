/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 */

import { TemporarilyDisabled } from "@/components/TemporarilyDisabled";

export default function AdminHeatmap() {
    return <TemporarilyDisabled feature="Admin Heatmap" />;
}
                        <h1 className="text-6xl font-black uppercase tracking-tighter">Signal Heatmap</h1>
                        <p className="text-white/40 max-w-xl font-medium">Real-time regional intelligence density and conversion rollups across the Hectic network.</p>
                    </div>

                    <div className="flex items-center gap-2 glass-dark p-2 rounded-full border border-white/5">
                        {[7, 14, 30].map(d => (
                            <Button
                                key={d}
                                onClick={() => setDays(d)}
                                variant={days === d ? "default" : "ghost"}
                                className={`rounded-full px-8 ${days === d ? 'bg-orange-500 text-white' : 'text-white/40'}`}
                            >
                                {d}D
                            </Button>
                        ))}
                    </div>
                </div>

                {/* KPI GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Intercepts', value: stats.reduce((acc, curr) => acc + curr.views, 0), icon: Activity, color: 'text-blue-500' },
                        { label: 'Signal Saves', value: stats.reduce((acc, curr) => acc + curr.saves, 0), icon: Zap, color: 'text-orange-500' },
                        { label: 'Conversion Rate', value: `${((stats.reduce((acc, curr) => acc + curr.saves, 0) / (stats.reduce((acc, curr) => acc + curr.views, 0) || 1)) * 100).toFixed(1)}%`, icon: Users, color: 'text-green-500' },
                        { label: 'Avg Confidence', value: '0.94', icon: Shield, color: 'text-purple-500' },
                    ].map((kpi, i) => (
                        <Card key={i} className="p-8 bg-white/[0.02] border-white/5 rounded-[2rem] space-y-4">
                            <div className="flex items-center justify-between">
                                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                                <Badge variant="outline" className="border-white/10 text-[10px] opacity-40">Live</Badge>
                            </div>
                            <div>
                                <div className="text-3xl font-black">{kpi.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/30">{kpi.label}</div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* HEATMAP / DATA GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LANE PERFORMANCE */}
                    <Card className="lg:col-span-8 p-12 bg-white/[0.02] border-white/5 rounded-[3rem] overflow-hidden">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-4">
                                <Map className="w-5 h-5 text-orange-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Lane Density</h3>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="h-64 flex items-center justify-center text-white/20 uppercase text-[10px] font-black tracking-widest animate-pulse">Scanning Network...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-white/30">Lane</th>
                                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Intercepts</th>
                                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Saves</th>
                                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Conv %</th>
                                                <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {Object.entries(stats.reduce((acc: any, curr) => {
                                                if (!acc[curr.laneId]) acc[curr.laneId] = { views: 0, saves: 0 };
                                                acc[curr.laneId].views += curr.views;
                                                acc[curr.laneId].saves += curr.saves;
                                                return acc;
                                            }, {})).map(([lane, data]: [string, any]) => (
                                                <tr key={lane} className="group">
                                                    <td className="py-6 font-black uppercase tracking-tighter text-2xl group-hover:text-orange-500 transition-colors">{lane}</td>
                                                    <td className="py-6 text-right font-bold text-white/60">{data.views}</td>
                                                    <td className="py-6 text-right font-bold text-white/60">{data.saves}</td>
                                                    <td className="py-6 text-right font-bold text-orange-500">{((data.saves / (data.views || 1)) * 100).toFixed(1)}%</td>
                                                    <td className="py-6 text-right">
                                                        <div className="inline-flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                            <span className="text-[10px] font-black uppercase opacity-40 text-green-500">Locked</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* CHANNEL TRUST */}
                    <Card className="lg:col-span-4 p-12 bg-white/[0.02] border-white/5 rounded-[3rem] space-y-12">
                        <div className="flex items-center gap-4">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Channel Reliability</h3>
                        </div>

                        <div className="space-y-8">
                            {[
                                { source: 'Skiddle API', confidence: 98, status: 'Active' },
                                { source: 'Ticketmaster', confidence: 94, status: 'Active' },
                                { source: 'RA Feeds', confidence: 82, status: 'Reduced' },
                                { source: 'Manual Ops', confidence: 100, status: 'Active' },
                            ].map(source => (
                                <div key={source.source} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-xl font-black uppercase tracking-tighter">{source.source}</div>
                                            <div className="text-[9px] font-black uppercase tracking-widest text-white/20">{source.status}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-blue-500">{source.confidence}%</div>
                                            <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Trust Rating</div>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${source.confidence}%` }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <p className="text-[10px] text-white/30 font-medium leading-relaxed uppercase tracking-widest">
                                Data synthesis protocols are currently healthy. Signal noise ratio is below 2.4% across all lanes.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
