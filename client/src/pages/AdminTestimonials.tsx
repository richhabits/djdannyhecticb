/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, ShieldCheck, ShieldAlert, Star, Plus, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";

export default function AdminTestimonials() {
    const { user, isAuthenticated } = useAuth();
    const utils = trpc.useUtils();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        event: "",
        videoUrl: "",
        rating: 5,
        transcript: ""
    });

    const { data: testimonials, isLoading } = trpc.videoTestimonials.adminList.useQuery({});

    const updateMutation = trpc.videoTestimonials.adminUpdate.useMutation({
        onSuccess: () => {
            toast.success("Testimonial updated");
            utils.videoTestimonials.adminList.invalidate();
            utils.videoTestimonials.list.invalidate();
        }
    });

    const deleteMutation = trpc.videoTestimonials.adminDelete.useMutation({
        onSuccess: () => {
            toast.success("Testimonial removed");
            utils.videoTestimonials.adminList.invalidate();
            utils.videoTestimonials.list.invalidate();
        }
    });

    const createMutation = trpc.videoTestimonials.create.useMutation({
        onSuccess: () => {
            toast.success("New testimonial added (Pending Approval)");
            setIsCreateOpen(false);
            setFormData({ name: "", event: "", videoUrl: "", rating: 5, transcript: "" });
            utils.videoTestimonials.adminList.invalidate();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    if (!isAuthenticated || user?.role !== "admin") {
        return <div className="p-12 text-center">Restricted Access.</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight">Proof Management</h1>
                    <p className="text-muted-foreground">Approve and feature video testimonials from clients</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Manual Testimonial</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Client Name</Label>
                                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Event / Context</Label>
                                <Input placeholder="e.g. Wedding, Club Set" value={formData.event} onChange={e => setFormData({ ...formData, event: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Direct Video URL (MP4/H.264)</Label>
                                <Input required placeholder="https://..." value={formData.videoUrl} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Rating (1-5)</Label>
                                <Input type="number" min={1} max={5} value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Highlights / Transcript</Label>
                                <Input placeholder="Short quote from the video" value={formData.transcript} onChange={e => setFormData({ ...formData, transcript: e.target.value })} />
                            </div>
                            <Button type="submit" className="w-full bg-orange-600" disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Persisting..." : "Save Testimonial"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="p-12 text-center text-muted-foreground uppercase font-black tracking-widest animate-pulse">
                    Synchronizing Proof Layer...
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {testimonials?.map((t: any) => (
                        <Card key={t.id} className={`overflow-hidden border-2 transition-all ${t.isApproved ? 'border-green-500/20' : 'border-yellow-500/20 bg-yellow-500/5'}`}>
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Preview Area */}
                                    <div className="w-full md:w-72 aspect-video md:aspect-auto bg-black relative shrink-0">
                                        <video src={t.videoUrl} className="w-full h-full object-cover opacity-50" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {!t.isApproved && (
                                                <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                                    Pending Review
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details Area */}
                                    <div className="flex-1 p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold">{t.name}</h3>
                                                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">{t.event || "General Client"}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-orange-500 fill-current' : 'text-muted-foreground'}`} />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-sm italic text-gray-300">"{t.transcript || "No transcript provided"}"</p>

                                        <div className="flex flex-wrap items-center gap-6 pt-2">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`approve-${t.id}`}
                                                    checked={t.isApproved}
                                                    onCheckedChange={(checked) => updateMutation.mutate({ id: t.id, isApproved: !!checked })}
                                                />
                                                <Label htmlFor={`approve-${t.id}`} className="text-xs font-bold uppercase">Approved</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`feature-${t.id}`}
                                                    checked={t.isFeatured}
                                                    onCheckedChange={(checked) => updateMutation.mutate({ id: t.id, isFeatured: !!checked })}
                                                />
                                                <Label htmlFor={`feature-${t.id}`} className="text-xs font-bold uppercase">Featured</Label>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold ml-auto">
                                                Added {format(new Date(t.createdAt), "PPP")}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="p-6 border-t md:border-t-0 md:border-l border-border flex flex-row md:flex-col gap-2 justify-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                            onClick={() => { if (confirm("DANGER: This will permanently remove the proof. Proceed?")) deleteMutation.mutate({ id: t.id }); }}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {testimonials?.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                            <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-muted-foreground uppercase">No Proof Found</h3>
                            <p className="text-sm text-muted-foreground">Start adding testimonials to build authority.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
