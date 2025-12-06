import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SetlistBuilder } from "@/components/DJTools";
import { MetaTagsComponent } from "@/components/MetaTags";
import { ArrowLeft, ListMusic } from "lucide-react";

export default function SetlistPage() {
  return (
    <>
      <MetaTagsComponent
        title="Setlist Builder | DJ Danny Hectic B"
        description="Build and manage your DJ setlists"
        url="/setlist"
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
          <div className="container flex items-center justify-between h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-accent" />
              <span className="font-semibold">Setlist Builder</span>
            </div>
            <div />
          </div>
        </header>

        {/* Content */}
        <main className="container py-12">
          <SetlistBuilder />
        </main>
      </div>
    </>
  );
}
