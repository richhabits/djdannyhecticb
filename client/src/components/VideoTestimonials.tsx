import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoTestimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  videoUrl: string;
  thumbnailUrl: string;
  quote: string;
  rating: number;
  eventType?: string;
}

// Mock video testimonials
const mockTestimonials: VideoTestimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Bride",
    videoUrl: "https://example.com/video1.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
    quote: "DJ Danny made our wedding absolutely incredible! The dance floor was packed all night.",
    rating: 5,
    eventType: "Wedding",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    role: "Club Manager",
    company: "Ministry of Sound",
    videoUrl: "https://example.com/video2.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=600",
    quote: "One of the best DJs we've had. The crowd energy was unreal!",
    rating: 5,
    eventType: "Club Night",
  },
  {
    id: "3",
    name: "Emily Chen",
    role: "Event Director",
    company: "Nike UK",
    videoUrl: "https://example.com/video3.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600",
    quote: "Professional, creative, and knows exactly how to read the room. Highly recommend!",
    rating: 5,
    eventType: "Corporate Event",
  },
  {
    id: "4",
    name: "David Thompson",
    role: "Birthday Host",
    videoUrl: "https://example.com/video4.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600",
    quote: "My 40th birthday party was legendary thanks to Danny. Everyone's still talking about it!",
    rating: 5,
    eventType: "Private Party",
  },
];

function VideoPlayer({ 
  src, 
  thumbnail, 
  className 
}: { 
  src: string; 
  thumbnail: string; 
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div 
      className={cn("relative overflow-hidden rounded-lg group", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(isPlaying ? false : true)}
    >
      {/* Thumbnail overlay when not playing */}
      {!isPlaying && (
        <div className="absolute inset-0 z-10">
          <img 
            src={thumbnail} 
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:scale-110"
            >
              <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
            </button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        className="w-full aspect-video object-cover"
        muted={isMuted}
        playsInline
        onEnded={() => setIsPlaying(false)}
      />

      {/* Controls overlay */}
      {showControls && isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
          <button
            onClick={toggleMute}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: VideoTestimonial }) {
  return (
    <Card className="overflow-hidden glass hover-lift">
      <VideoPlayer
        src={testimonial.videoUrl}
        thumbnail={testimonial.thumbnailUrl}
        className="aspect-video"
      />
      
      <div className="p-6 space-y-4">
        {/* Rating */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
              )}
            />
          ))}
        </div>

        {/* Quote */}
        <div className="relative">
          <Quote className="absolute -top-2 -left-1 w-8 h-8 text-accent/20" />
          <p className="text-sm italic pl-6">&ldquo;{testimonial.quote}&rdquo;</p>
        </div>

        {/* Author */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <p className="font-semibold">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">
              {testimonial.role}
              {testimonial.company && ` at ${testimonial.company}`}
            </p>
          </div>
          {testimonial.eventType && (
            <span className="px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full">
              {testimonial.eventType}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

export function VideoTestimonials({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % mockTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + mockTestimonials.length) % mockTestimonials.length);
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Video Testimonials</h2>
          <p className="text-muted-foreground mt-2">Hear from our happy clients</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "carousel" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("carousel")}
          >
            Carousel
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            Grid
          </Button>
        </div>
      </div>

      {viewMode === "carousel" ? (
        <div className="relative">
          {/* Main carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {mockTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="max-w-2xl mx-auto">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10"
            onClick={nextTestimonial}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {mockTestimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  i === currentIndex ? "bg-accent w-6" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {mockTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      )}

      {/* Call to action */}
      <Card className="p-8 text-center glass">
        <h3 className="text-xl font-bold mb-2">Want to share your experience?</h3>
        <p className="text-muted-foreground mb-4">
          Submit your video testimonial and get featured on our website!
        </p>
        <Button className="gradient-bg">Submit Your Testimonial</Button>
      </Card>
    </div>
  );
}

// Compact testimonial strip
export function TestimonialStrip() {
  return (
    <div className="overflow-hidden py-6 bg-card/30">
      <div className="animate-marquee whitespace-nowrap flex gap-8">
        {[...mockTestimonials, ...mockTestimonials].map((testimonial, i) => (
          <div key={`${testimonial.id}-${i}`} className="inline-flex items-center gap-4">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <p className="text-sm italic text-muted-foreground max-w-xs truncate">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <span className="font-semibold text-sm">- {testimonial.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoTestimonials;
