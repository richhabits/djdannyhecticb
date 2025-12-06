import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { VideoTestimonials, TestimonialStrip } from "@/components/VideoTestimonials";
import { MetaTagsComponent } from "@/components/MetaTags";
import { ArrowLeft, Video } from "lucide-react";

export default function VideoTestimonialsPage() {
  return (
    <>
      <MetaTagsComponent
        title="Video Testimonials | DJ Danny Hectic B"
        description="Watch video testimonials from happy clients who've booked DJ Danny Hectic B"
        url="/video-testimonials"
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
          <div className="container flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-accent" />
              <span className="font-semibold">Video Testimonials</span>
            </div>
            <Link href="/testimonials">
              <Button variant="outline" size="sm">Written Reviews</Button>
            </Link>
          </div>
        </header>

        {/* Testimonial Strip */}
        <TestimonialStrip />

        {/* Content */}
        <main className="container py-12">
          <VideoTestimonials />
        </main>
      </div>
    </>
  );
}
