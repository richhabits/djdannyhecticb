/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, MapPin, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoTestimonialCardProps {
    videoUrl: string;
    thumbnailUrl?: string;
    name: string;
    role?: string;
    eventType?: string;
    location?: string;
    rating?: number;
}

export function VideoTestimonialCard({
    videoUrl,
    thumbnailUrl,
    name,
    role,
    eventType,
    location,
    rating
}: VideoTestimonialCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-orange-500/30"
        >
            {/* Video Container */}
            <div className="relative aspect-[9/16] md:aspect-video overflow-hidden bg-zinc-900">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    poster={thumbnailUrl}
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-cover"
                    onClick={togglePlay}
                />

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors"
                        >
                            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white fill-current" />}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors"
                        >
                            {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                        </button>
                    </div>
                </div>

                {/* Play Icon Placeholder (when not playing) */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl animate-pulse">
                            <Play className="w-8 h-8 text-white fill-current ml-1" />
                        </div>
                    </div>
                )}
            </div>

            {/* Info Content */}
            <div className="p-6 space-y-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">{name}</h4>
                        <div className="flex items-center gap-1 text-xs text-orange-400 font-bold tracking-widest uppercase mt-1">
                            <MapPin className="w-3 h-3" />
                            {location || "Verified Client"}
                        </div>
                    </div>
                    <Quote className="w-8 h-8 text-white/10" />
                </div>

                <p className="text-sm text-gray-400 font-medium leading-relaxed line-clamp-2 italic">
                    "{role || eventType || "Danny made our event unforgettable. Professionalism and energy were matching the crowd perfectly."}"
                </p>

                {rating && (
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-1.5 h-6 rounded-full",
                                    i < rating ? "bg-orange-500" : "bg-white/5"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
