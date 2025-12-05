import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Star } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function VideoTestimonials({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const { data: testimonials, isLoading } = trpc.testimonials.list.useQuery({
    featuredOnly,
  });
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No video testimonials available yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <Card
            key={testimonial.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
            onClick={() => setSelectedVideo(testimonial.videoUrl)}
          >
            <div className="aspect-video relative bg-black">
              {testimonial.thumbnailUrl ? (
                <img
                  src={testimonial.thumbnailUrl}
                  alt={testimonial.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-16 h-16 text-white opacity-50" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1">{testimonial.name}</h3>
              {testimonial.title && (
                <p className="text-sm text-muted-foreground mb-2">{testimonial.title}</p>
              )}
              {testimonial.rating && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < testimonial.rating!
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          {selectedVideo && (
            <div className="aspect-video">
              <iframe
                src={selectedVideo}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
