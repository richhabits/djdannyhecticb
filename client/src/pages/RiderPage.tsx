import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TechnicalRider } from "@/components/DJTools";
import { MetaTagsComponent } from "@/components/MetaTags";
import { ArrowLeft, FileText } from "lucide-react";

export default function RiderPage() {
  return (
    <>
      <MetaTagsComponent
        title="Technical Rider | DJ Danny Hectic B"
        description="Technical requirements and equipment specifications for booking DJ Danny Hectic B"
        url="/rider"
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
              <FileText className="w-5 h-5 text-accent" />
              <span className="font-semibold">Technical Rider</span>
            </div>
            <Link href="/epk">
              <Button variant="outline" size="sm">View Full EPK</Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="container py-12">
          <TechnicalRider />
        </main>
      </div>
    </>
  );
}
