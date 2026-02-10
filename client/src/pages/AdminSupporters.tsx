/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 */

import { TemporarilyDisabled } from "@/components/TemporarilyDisabled";

export default function AdminSupporters() {
    return <TemporarilyDisabled feature="Admin Supporters" />;
}
            success: () => {
                refetch();
                setTargetUserId("");
                setReason("");
                return "User Elevated to Supporter Status";
            },
            error: "Elevation Protocol Failed"
        });
    };

    const handleDemote = (userId: number) => {
        const confirmReason = prompt("Reason for demotion?");
        if (!confirmReason) return;

        toast.promise(demote.mutateAsync({ userId, reason: confirmReason }), {
            loading: "Revoking Supporter Status...",
            success: () => {
                refetch();
                return "Elite Status Revoked";
            },
            error: "Revocation Failed"
        });
    };

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-48 font-sans">
            <div className="container space-y-12">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Tier Management</span>
                        </div>
                        <h1 className="text-6xl font-black uppercase tracking-tighter">Supporters</h1>
                        <p className="text-white/40 max-w-xl font-medium">Govern the elite tier of the Hectic Empire. Oversee promotions, manual overrides and community meritocracy.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* ELEVATION PANEL */}
                    <Card className="lg:col-span-4 p-12 bg-white/[0.02] border-white/5 rounded-[3rem] space-y-8">
                        <div className="flex items-center gap-4">
                            <UserPlus className="w-5 h-5 text-green-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Manual Promotion</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">User ID (Numeric)</label>
                                <Input
                                    placeholder="e.g. 1024"
                                    value={targetUserId}
                                    onChange={(e) => setTargetUserId(e.target.value)}
                                    className="bg-black border-white/10 rounded-2xl h-14"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">Promotion Reason</label>
                                <Input
                                    placeholder="High community contribution"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="bg-black border-white/10 rounded-2xl h-14"
                                />
                            </div>
                            <Button
                                onClick={handlePromote}
                                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-xs"
                            >
                                Elevate Signal Status
                            </Button>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <div className="flex items-center gap-3 text-white/30">
                                <History className="w-4 h-4" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Audit logged to governance node</span>
                            </div>
                        </div>
                    </Card>

                    {/* SUPPORTERS LIST */}
                    <Card className="lg:col-span-8 p-12 bg-white/[0.02] border-white/5 rounded-[3rem] space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Users className="w-5 h-5 text-orange-500" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Elite Suppression List</h3>
                            </div>
                            <Badge variant="outline" className="opacity-40 text-[10px] font-black uppercase">{supporters?.length || 0} Nodes</Badge>
                        </div>

                        <div className="space-y-4">
                            {supporters?.map(user => (
                                <div key={user.id} className="group flex flex-col md:flex-row items-center justify-between p-8 glass-dark border border-white/5 rounded-3xl hover:border-orange-500/30 transition-all gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-2xl">
                                            {user.displayName?.[0] || user.name?.[0] || '?'}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black uppercase tracking-tighter">{user.displayName || user.name || 'Anonymous User'}</h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <Badge className="bg-orange-500 text-white border-none uppercase text-[8px] font-black px-3 h-5">Supporter</Badge>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">ID: #{user.id}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDemote(user.id)}
                                            className="text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl px-6 h-12 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <UserMinus className="w-4 h-4 mr-2" /> Revoke
                                        </Button>
                                        <Button variant="outline" className="border-white/10 rounded-xl px-6 h-12 text-[10px] font-black uppercase tracking-widest">
                                            View Logs
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {supporters?.length === 0 && (
                                <div className="py-24 text-center space-y-4">
                                    <Users className="w-12 h-12 text-white/5 mx-auto" />
                                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">No active supporters established in the network.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
