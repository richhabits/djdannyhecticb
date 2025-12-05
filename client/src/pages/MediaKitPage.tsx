import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MediaKit } from "@/components/DJTools";
import { MetaTagsComponent } from "@/components/MetaTags";
import { ArrowLeft, Image } from "lucide-react";

export default function MediaKitPage() {
  return (
    <>
      <MetaTagsComponent
        title="Media Kit | DJ Danny Hectic B"
        description="Download high-resolution press photos, logos, and biographies for DJ Danny Hectic B"
        url="/media-kit"
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
              <Image className="w-5 h-5 text-accent" />
              <span className="font-semibold">Media Kit</span>
            </div>
            <Link href="/epk">
              <Button variant="outline" size="sm">View Full EPK</Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="container py-12">
          <MediaKit />
        </main>
      </div>
    </>
  );
}
