/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { trpc } from "@/lib/trpc";
import { VideoTestimonialCard } from "./VideoTestimonialCard";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface VideoTestimonialsSectionProps {
    limit?: number;
    isFeatured?: boolean;
}

export function VideoTestimonialsSection({ limit = 3, isFeatured }: VideoTestimonialsSectionProps) {
    const { data: testimonials, isLoading } = trpc.videoTestimonials.list.useQuery({
        limit,
        isFeatured
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
                {[...Array(limit)].map((_, i) => (
                    <div key={i} className="aspect-[9/16] bg-white/5 rounded-3xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!testimonials || testimonials.length === 0) {
        return null;
    }

    return (
        <section className="py-20 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-orange-500 font-black tracking-[0.3em] uppercase text-xs">
                        <Sparkles className="w-4 h-4" />
                        Verified Confidence
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Why People <span className="text-gradient">Book Danny</span>
                    </h2>
                    <p className="text-muted-foreground max-w-xl text-lg">
                        Direct feedback from clubs, private clients, and brands who have experienced the Hectic energy first-hand.
                    </p>
                </div>

                <Link href="/testimonials">
                    <Button variant="outline" className="rounded-full px-8 py-6 border-white/20 hover:bg-white/5 group">
                        All Success Stories
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {testimonials.map((t: any) => (
                    <VideoTestimonialCard
                        key={t.id}
                        videoUrl={t.videoUrl}
                        thumbnailUrl={t.thumbnailUrl || undefined}
                        name={t.name}
                        role={t.transcript || undefined}
                        eventType={t.event || undefined}
                        location={t.event || "Verified Show"}
                        rating={t.rating || 5}
                    />
                ))}
            </div>
        </section>
    );
}
