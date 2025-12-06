/**
 * Video Testimonials Component
 * Displays and manages video testimonials from fans
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface VideoTestimonial {
  id: number;
  name: string;
  location?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description?: string;
  rating?: number;
  createdAt: Date;
}

interface VideoTestimonialsProps {
  limit?: number;
  featured?: boolean;
}

export function VideoTestimonials({ limit = 6, featured = false }: VideoTestimonialsProps) {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);

  // In a real implementation, this would fetch from a testimonials endpoint
  // For now, using mock data structure
  const testimonials: VideoTestimonial[] = [];

  const handlePlay = (id: number) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No video testimonials yet. Be the first!</p>
        <Button className="mt-4" onClick={() => window.location.href = "/contact"}>
          Submit Your Testimonial
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.slice(0, limit).map((testimonial) => (
        <Card key={testimonial.id} className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">{testimonial.name}</CardTitle>
            {testimonial.location && (
              <p className="text-sm text-muted-foreground">{testimonial.location}</p>
            )}
            {testimonial.rating && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < testimonial.rating! ? "text-yellow-400" : "text-gray-300"}>
                    ★
                  </span>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {playingId === testimonial.id ? (
                <video
                  src={testimonial.videoUrl}
                  controls
                  autoPlay
                  muted={muted}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  {testimonial.thumbnailUrl ? (
                    <img
                      src={testimonial.thumbnailUrl}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Play className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute inset-0 m-auto bg-black/50 hover:bg-black/70"
                    onClick={() => handlePlay(testimonial.id)}
                  >
                    <Play className="h-8 w-8 text-white" />
                  </Button>
                </>
              )}
            </div>
            {testimonial.description && (
              <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                {testimonial.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
