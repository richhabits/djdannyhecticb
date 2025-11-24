import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Music, Play, Download } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { SocialShare } from "@/components/SocialShare";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function Mixes() {
  const { isAuthenticated } = useAuth();
  const analytics = useAnalytics();
  const [playing, setPlaying] = useState<number | null>(null);
  const { data: mixes, isLoading } = trpc.mixes.free.useQuery();
  
  const handlePlay = (mixId: number, mixTitle: string) => {
    setPlaying(mixId);
    analytics.trackClick("mix_play", { mixId, mixTitle });
  };
  
  const handleDownload = (mixId: number, mixTitle: string) => {
    analytics.trackDownload("mix", mixId);
  };
  
  const handleShare = (platform: string, mixTitle: string) => {
    analytics.trackShare(platform, "mix");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Music className="w-6 h-6" />
            <span className="font-bold">DJ Danny Hectic B</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/mixes" className="text-sm font-medium text-accent">Mixes</Link>
            <Link href="/events" className="text-sm hover:text-accent">Events</Link>
            <Link href="/live-studio" className="text-sm hover:text-accent">Live</Link>
            <Link href="/podcasts" className="text-sm hover:text-accent">Podcast</Link>
            {isAuthenticated && <Link href="/bookings" className="text-sm hover:text-accent">Book</Link>}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-purple-900/20 to-background border-b border-border">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Free Mixes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore our collection of exclusive mixes. Stream, download, and enjoy the best beats.
          </p>
        </div>
      </section>

      {/* Mixes Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="w-full h-48 bg-muted rounded-lg mb-4" />
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </Card>
              ))}
            </div>
          ) : mixes && mixes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mixes.map((mix) => (
                <Card key={mix.id} className="overflow-hidden hover:border-accent transition group">
                  <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    {mix.coverImageUrl ? (
                      <img src={mix.coverImageUrl} alt={mix.title} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-16 h-16 text-white/50" />
                    )}
                    <button
                      onClick={() => handlePlay(mix.id, mix.title)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </button>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{mix.title}</h3>
                    {mix.genre && <p className="text-sm text-muted-foreground mb-2">{mix.genre}</p>}
                    {mix.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{mix.description}</p>}
                    {mix.duration && (
                      <p className="text-xs text-muted-foreground mb-4">
                        {Math.floor(mix.duration / 60)}:{String(mix.duration % 60).padStart(2, '0')}
                      </p>
                    )}
                    {playing === mix.id && (
                      <audio autoPlay controls className="w-full mb-4">
                        <source src={mix.audioUrl} type="audio/mpeg" />
                      </audio>
                    )}
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handlePlay(mix.id, mix.title)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </Button>
                        {mix.downloadUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownload(mix.id, mix.title)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <SocialShare
                        url={`${window.location.origin}/mixes#mix-${mix.id}`}
                        title={mix.title}
                        description={mix.description || `Check out ${mix.title} by DJ Danny Hectic B`}
                        variant="icon-only"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No mixes available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-card border-t border-border">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4">Want to Book DJ Services?</h2>
          {isAuthenticated ? (
            <Link href="/bookings">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                Create Booking Request
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                Sign In to Book
              </Button>
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
