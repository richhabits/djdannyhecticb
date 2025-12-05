import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialFeed, SocialLinksWidget } from "@/components/SocialFeed";
import { YouTubeFeed, LiveStreamWidget } from "@/components/YouTubeIntegration";
import { SpotifyPlayer, SpotifyPlaylists, RecentlyPlayed } from "@/components/SpotifyIntegration";
import { MetaTagsComponent } from "@/components/MetaTags";
import { ArrowLeft, Radio, Instagram, Youtube, Music } from "lucide-react";

export default function SocialPage() {
  return (
    <>
      <MetaTagsComponent
        title="Social & Streams | DJ Danny Hectic B"
        description="Follow DJ Danny Hectic B on all social platforms and streaming services"
        url="/social"
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
              <Radio className="w-5 h-5 text-accent" />
              <span className="font-semibold">Social & Streams</span>
            </div>
            <SocialLinksWidget />
          </div>
        </header>

        {/* Live Stream Banner */}
        <div className="container py-4">
          <LiveStreamWidget />
        </div>

        {/* Content */}
        <main className="container py-8">
          <Tabs defaultValue="feed" className="space-y-8">
            <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="youtube" className="flex items-center gap-2">
                <Youtube className="w-4 h-4" />
                YouTube
              </TabsTrigger>
              <TabsTrigger value="spotify" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                Spotify
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                All
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed">
              <SocialFeed />
            </TabsContent>

            <TabsContent value="youtube">
              <YouTubeFeed />
            </TabsContent>

            <TabsContent value="spotify">
              <div className="space-y-8">
                <SpotifyPlayer />
                <div className="grid gap-8 lg:grid-cols-2">
                  <SpotifyPlaylists />
                  <RecentlyPlayed />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="all">
              <div className="space-y-12">
                <SocialFeed />
                <YouTubeFeed />
                <div className="grid gap-8 lg:grid-cols-2">
                  <SpotifyPlaylists />
                  <RecentlyPlayed />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
