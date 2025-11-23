import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Music, Play, Download, Headphones } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import AudioPlayer from "@/components/AudioPlayer";

export default function Mixes() {
  const { isAuthenticated } = useAuth();
  const [playing, setPlaying] = useState<number | null>(null);
  const [selectedMixes, setSelectedMixes] = useState<any[]>([]);
  const { data: mixes, isLoading } = trpc.mixes.free.useQuery();

  // Sample tracks for demonstration
  const sampleTracks = [
    {
      id: "1",
      title: "UK Garage Classics Mix",
      artist: "DJ Danny Hectic B",
      duration: 3600,
      spotifyUrl: "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp",
      soundcloudUrl: "https://soundcloud.com/user-example/track-example",
      coverArt: "/logo-danny-hectic-b.png"
    },
    {
      id: "2",
      title: "Soulful House Journey",
      artist: "DJ Danny Hectic B",
      duration: 4500,
      spotifyUrl: "https://open.spotify.com/track/0DiWol3AO6WpXZgp0goxAV",
      coverArt: "/logo-danny-hectic-b.png"
    },
    {
      id: "3",
      title: "Amapiano Vibes",
      artist: "DJ Danny Hectic B",
      duration: 3300,
      soundcloudUrl: "https://soundcloud.com/user-example/amapiano-mix",
      coverArt: "/logo-danny-hectic-b.png"
    },
    {
      id: "4",
      title: "Funky House Sessions",
      artist: "DJ Danny Hectic B",
      duration: 3900,
      coverArt: "/logo-danny-hectic-b.png"
    },
    {
      id: "5",
      title: "Grime & Bassline Mix",
      artist: "DJ Danny Hectic B",
      duration: 4200,
      coverArt: "/logo-danny-hectic-b.png"
    },
  ];

  const handlePlayMix = (mix: any) => {
    setSelectedMixes([mix]);
  };

  const handlePlayAll = () => {
    setSelectedMixes(sampleTracks);
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
      <section className="py-12 md:py-20 bg-gradient-to-b from-orange-900/20 to-background border-b border-border">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4"><span className="gradient-text">Free Mixes</span></h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
                Explore our collection of exclusive mixes featuring UK Garage, House, Grime & Amapiano. Stream on Spotify, SoundCloud, or download.
              </p>
            </div>
            <Button size="lg" onClick={handlePlayAll} className="gradient-bg hover-lift">
              <Headphones className="w-5 h-5 mr-2" />
              Play All Mixes
            </Button>
          </div>
        </div>
      </section>

      {/* Audio Player */}
      {selectedMixes.length > 0 && (
        <section className="py-8 border-b border-border sticky top-16 z-40 bg-background/95 backdrop-blur">
          <div className="container px-4">
            <AudioPlayer tracks={selectedMixes} autoPlay />
          </div>
        </section>
      )}

      {/* Mixes Grid */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">All Mixes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {sampleTracks.map((mix) => (
              <Card key={mix.id} className="overflow-hidden glass hover-lift group">
                <div className="relative h-48 bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                  {mix.coverArt ? (
                    <img src={mix.coverArt} alt={mix.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-16 h-16 text-white/50" />
                  )}
                  <button
                    onClick={() => handlePlayMix(mix)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 smooth-transition"
                  >
                    <div className="w-16 h-16 rounded-full glass flex items-center justify-center hover:scale-110 smooth-transition">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">{mix.title}</h3>
                  <p className="text-sm text-accent font-semibold mb-2">{mix.artist}</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Duration: {Math.floor(mix.duration / 60)} min
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handlePlayMix(mix)}
                      className="w-full gradient-bg hover-lift"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play Now
                    </Button>
                    <div className="flex gap-2">
                      {mix.spotifyUrl && (
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          Spotify
                        </Button>
                      )}
                      {mix.soundcloudUrl && (
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          SoundCloud
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
