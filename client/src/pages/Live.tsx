import { ShoutForm } from "@/components/ShoutForm";
import { TrackRequests } from "@/components/TrackRequests";
import { NowPlaying } from "@/components/NowPlaying";
import { ShowSchedule } from "@/components/ShowSchedule";
import { HecticHotline } from "@/components/HecticHotline";
import { LockedInCounter } from "@/components/LockedInCounter";
import { SocialLinks } from "@/components/SocialLinks";
import { MetaTagsComponent } from "@/components/MetaTags";
import { LiveChatDanny } from "@/components/LiveChatDanny";
import { NowListeningShare } from "@/components/NowListeningShare";
import { SocialActivityFeed } from "@/components/SocialActivityFeed";
import { InteractiveSocialShare } from "@/components/InteractiveSocialShare";
import { trpc } from "@/lib/trpc";
import { Radio, Users, Share2, Sparkles } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Live() {
  const { data: activeStream } = trpc.streams.active.useQuery(undefined, { retry: false });
  const { data: nowPlaying } = trpc.tracks.nowPlaying.useQuery();
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <MetaTagsComponent
        title="Hectic Radio - Live | DJ Danny Hectic B"
        description="Lock in with DJ Danny Hectic B on Hectic Radio. Listen live, request tracks, send shouts, and vibe with the crew."
        url="/live"
        type="music.radio_station"
      />
      <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-900/20 via-background to-background py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-orange-700/5" />
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="container relative z-10">
          <div className="text-center space-y-6 md:space-y-8 px-4">
            <div className="inline-flex flex-wrap items-center justify-center gap-2">
              <span className="px-4 py-2 rounded-full glass border border-accent/50 text-sm text-accent font-semibold flex items-center gap-2">
                <Radio className="w-4 h-4" />
                LIVE NOW on Hectic Radio
              </span>
              {isAuthenticated && (
                <span className="px-3 py-1 rounded-full bg-accent/20 text-xs text-accent flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Welcome back, {user?.name?.split(" ")[0] || "fam"}!
                </span>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              <span className="gradient-text">Hectic Radio</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Lock in with DJ Danny Hectic B. Request tracks, send shouts, and vibe with the crew.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <LockedInCounter />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Join the community</span>
              </div>
            </div>
            {activeStream && (
              <p className="text-sm text-muted-foreground">
                Currently streaming: <span className="font-semibold text-accent">{activeStream.name}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-8 px-4">
        {/* Share What You're Listening To - Featured Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold">Share the Vibes</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NowListeningShare />
            <SocialActivityFeed maxItems={10} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Now Playing */}
          <div className="lg:col-span-1">
            <NowPlaying />
          </div>

          {/* Track Requests */}
          <div className="lg:col-span-2">
            <TrackRequests />
          </div>
          
          {/* AI Chat */}
          <div className="lg:col-span-1">
            <LiveChatDanny />
          </div>
          
          {/* Show Schedule */}
          <div className="lg:col-span-2">
            <ShowSchedule />
          </div>
        </div>

        {/* Shout Form + Hotline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ShoutForm />
          <div className="flex items-center justify-center">
            <HecticHotline />
          </div>
        </div>

        {/* Interactive Social Share */}
        <div className="mb-8">
          <InteractiveSocialShare
            contentType="station"
            shareUrl="/live"
            shareTitle="Hectic Radio - Live with DJ Danny Hectic B"
            shareDescription="Lock in and vibe with the crew. Listen live, request tracks, and send shouts!"
            contentTitle={nowPlaying?.title}
            contentArtist={nowPlaying?.artist}
            contentId={nowPlaying?.id}
            variant="full"
          />
        </div>

        {/* Social Links */}
        <div className="mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">Follow Hectic Radio</p>
          <SocialLinks variant="compact" className="justify-center" />
        </div>
      </div>
      
      {/* Floating Share Button */}
      <InteractiveSocialShare
        contentType="now_playing"
        shareUrl="/live"
        shareTitle={nowPlaying ? `🎧 Now Playing: ${nowPlaying.title} by ${nowPlaying.artist}` : "Hectic Radio - Live"}
        shareDescription="Tune in to Hectic Radio! 🔥"
        contentTitle={nowPlaying?.title}
        contentArtist={nowPlaying?.artist}
        contentId={nowPlaying?.id}
        variant="floating"
      />
      </div>
    </>
  );
}

