import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Music, Play, Download, Headphones, X, Disc, Filter, Heart, HeartOff, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import ReactPlayer from "react-player";
import { MetaTagsComponent } from "@/components/MetaTags";
import { MusicStructuredData } from "@/components/StructuredData";
import { cn } from "@/lib/utils";
import { Recommendations } from "@/components/Recommendations";

export default function Mixes() {
  const { isAuthenticated, user } = useAuth();
  const [playing, setPlaying] = useState<number | null>(null);
  const [selectedMixes, setSelectedMixes] = useState<any[]>([]);
  // Track which mix is playing in "Deep Embed" mode
  const [playingExternal, setPlayingExternal] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterGenre, setFilterGenre] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  const { data: mixes, isLoading } = trpc.mixes.free.useQuery();
  
  // Get user favorites if authenticated
  const { data: favorites = [] } = trpc.favorites.list.useQuery(
    { entityType: "mix" },
    { enabled: isAuthenticated }
  );
  const favoriteIds = new Set(favorites.map((f: any) => f.entityId));
  
  const toggleFavorite = trpc.favorites.add.useMutation();
  const removeFavorite = trpc.favorites.remove.useMutation();

  // Sample tracks for demonstration (Enhanced with more external links)
  const sampleTracks = [
    {
      id: "1",
      title: "UK Garage Classics Mix",
      artist: "DJ Danny Hectic B",
      duration: 3600,
      spotifyUrl: "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp",
      soundcloudUrl: "https://soundcloud.com/djdannyhecticb/garage-nation-promo",
      coverArt: "/logo-danny-hectic-b.png"
    },
    {
      id: "2",
      title: "Soulful House Journey",
      artist: "DJ Danny Hectic B",
      duration: 4500,
      spotifyUrl: "https://open.spotify.com/track/0DiWol3AO6WpXZgp0goxAV",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Placeholder
      coverArt: "/logo-danny-hectic-b.png"
    },
    {
      id: "3",
      title: "Amapiano Vibes",
      artist: "DJ Danny Hectic B",
      duration: 3300,
      soundcloudUrl: "https://soundcloud.com/djdannyhecticb/amapiano-sessions-vol-1",
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
    // Priority: External Link (Deep Embed) -> Internal Audio
    if (mix.soundcloudUrl || mix.youtubeUrl) {
      setPlayingExternal(String(mix.id));
      // Stop internal player if running
      setSelectedMixes([]);
    } else {
      setPlayingExternal(null);
      setSelectedMixes([{
        id: String(mix.id),
        title: mix.title,
        artist: mix.artist || "DJ Danny Hectic B",
        duration: mix.duration || 0,
        url: mix.audioUrl,
        coverArt: mix.coverImageUrl,
      }]);
    }
  };

  const handlePlayAll = () => {
    if (!mixes) return;
    setPlayingExternal(null);
    setSelectedMixes(mixes.map(m => ({
      id: String(m.id),
      title: m.title,
      artist: m.artist || "DJ Danny Hectic B",
      duration: m.duration || 0,
      url: m.audioUrl,
      coverArt: m.coverImageUrl,
    })));
  };

  const utils = trpc.useUtils();
  const handleDownload = async (id: number) => {
    try {
      const { url } = await utils.mixes.downloadUrl.fetch({ id });
      window.open(url, '_blank');
    } catch (e) {
      // toast.error("Failed to get download link");
    }
  };

  return (
    <>
      <MetaTagsComponent
        title="DJ Mixes Archive | DJ Danny Hectic B - UK Garage & House Music"
        description="Listen to DJ Danny Hectic B's collection of UK Garage and House music mixes. Free downloads and streaming available. 30+ years of legendary mixes."
        url="/mixes"
        keywords="DJ mixes, UK Garage, House Music, DJ Danny Hectic B, free mixes, music archive, download mixes"
        canonical={typeof window !== "undefined" ? `${window.location.origin}/mixes` : "https://djdannyhecticb.co.uk/mixes"}
      />
      {mixes && mixes.length > 0 && mixes[0] && (
        <MusicStructuredData
          name={mixes[0].title}
          description={mixes[0].description || mixes[0].title}
          image={mixes[0].coverImageUrl}
          url={typeof window !== "undefined" ? `${window.location.origin}/mixes/${mixes[0].id}` : `https://djdannyhecticb.co.uk/mixes/${mixes[0].id}`}
          datePublished={mixes[0].createdAt.toISOString()}
          audioUrl={mixes[0].audioUrl}
        />
      )}
      <div className="min-h-screen bg-background text-foreground font-mono pt-14">

        {/* Brutalist Header */}
        <section className="border-b border-foreground px-4 py-8 md:px-6 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-6xl md:text-9xl font-black uppercase leading-[0.8] tracking-tighter">
              The<br />Archive
            </h1>
          </div>
          <div className="md:text-right space-y-4">
            <div className="text-right">
              <p className="text-sm font-bold uppercase tracking-widest mb-2 text-muted-foreground">Total Audio</p>
              <p className="text-xl font-bold uppercase">500+ Hours</p>
            </div>
            <Button size="lg" onClick={handlePlayAll} className="rounded-none bg-accent text-foreground hover:bg-foreground hover:text-background border border-foreground font-black uppercase tracking-widest">
              <Play className="w-5 h-5 mr-2" />
              Play All
            </Button>
          </div>
        </section>

        {/* Audio Player Bar */}
        {selectedMixes.length > 0 && (
          <section className="border-b border-foreground sticky top-14 z-40 bg-background">
            <AudioPlayer tracks={selectedMixes} autoPlay />
          </section>
        )}

        {/* Filters Bar */}
        <section className="sticky top-14 z-30 bg-background border-b border-foreground px-4 py-4">
          <div className="container max-w-7xl mx-auto flex flex-wrap items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-none border-foreground uppercase font-bold"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            {showFilters && (
              <div className="flex flex-wrap gap-4 items-center w-full">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold uppercase">Genre:</label>
                  <select
                    value={filterGenre}
                    onChange={(e) => setFilterGenre(e.target.value)}
                    className="bg-background border border-foreground px-3 py-1 uppercase font-bold text-sm"
                  >
                    <option value="All">All</option>
                    <option value="UK Garage">UK Garage</option>
                    <option value="House">House</option>
                    <option value="Techno">Techno</option>
                    <option value="Drum & Bass">Drum & Bass</option>
                    <option value="Grime">Grime</option>
                    <option value="Amapiano">Amapiano</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold uppercase">Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-background border border-foreground px-3 py-1 uppercase font-bold text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title A-Z</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Mixes List - Raw Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:gap-[1px] bg-foreground border-b border-foreground">
          {(() => {
            let filtered = (mixes || sampleTracks).filter((mix) => {
              if (filterGenre !== "All" && mix.genre !== filterGenre) return false;
              return true;
            });

            // Sort
            filtered = [...filtered].sort((a, b) => {
              if (sortBy === "newest") {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
              } else if (sortBy === "oldest") {
                return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
              } else {
                return (a.title || "").localeCompare(b.title || "");
              }
            });

            return filtered.map((mix) => {
              const isPlayingExternal = playingExternal === String(mix.id);
              const hasExternalLink = mix.soundcloudUrl || mix.youtubeUrl;
              const isFavorited = isAuthenticated && favoriteIds.has(mix.id);

              return (
                <div key={mix.id} className="bg-background group relative flex flex-col h-full md:border-r border-b border-foreground last:border-0 hover:bg-muted/20 transition-colors duration-0">

                {/* Visual / Player Area */}
                <div className="aspect-video bg-black relative overflow-hidden border-b border-foreground">
                  {isPlayingExternal ? (
                    <div className="w-full h-full">
                      <ReactPlayer
                        url={mix.soundcloudUrl || mix.youtubeUrl}
                        width="100%"
                        height="100%"
                        playing={true}
                        controls={true}
                        config={{ soundcloud: { options: { visual: true } } }}
                      />
                      <button
                        onClick={() => setPlayingExternal(null)}
                        className="absolute top-0 right-0 p-2 bg-foreground text-background font-bold uppercase text-xs"
                      >
                        [X] Close
                      </button>
                    </div>
                  ) : (
                    <>
                      {(mix.coverImageUrl || mix.coverArt) ? (
                        <img src={mix.coverImageUrl || mix.coverArt} className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-0" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/10">
                          <Disc className="w-16 h-16 text-muted-foreground opacity-20" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-0 gap-4">
                        <Button
                          onClick={() => handlePlayMix(mix)}
                          className="rounded-none bg-foreground text-background hover:bg-white border border-foreground font-bold uppercase"
                        >
                          {hasExternalLink ? <Play className="w-5 h-5 mr-2" /> : <Headphones className="w-5 h-5 mr-2" />}
                          {hasExternalLink ? "Stream" : "Listen"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                  {/* Meta */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="mb-6">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-2xl font-black uppercase leading-tight group-hover:text-accent transition-colors duration-0 flex-1">
                          {mix.title}
                        </h3>
                        {isAuthenticated && (
                          <button
                            onClick={async () => {
                              if (isFavorited) {
                                await removeFavorite.mutateAsync({ entityType: "mix", entityId: mix.id });
                              } else {
                                await toggleFavorite.mutateAsync({ entityType: "mix", entityId: mix.id });
                              }
                            }}
                            className="flex-shrink-0 p-2 hover:bg-muted rounded"
                          >
                            {isFavorited ? (
                              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                            ) : (
                              <Heart className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-sm font-bold uppercase text-muted-foreground tracking-widest">
                        {mix.artist || "DJ Danny Hectic B"}
                      </p>
                      {mix.genre && (
                        <p className="text-xs text-muted-foreground mt-1">{mix.genre}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {mix.spotifyUrl && (
                        <a href={mix.spotifyUrl} target="_blank" className="flex-1 bg-transparent border border-foreground py-3 text-center font-bold uppercase text-xs hover:bg-foreground hover:text-background transition-colors duration-0">
                          Spotify
                        </a>
                      )}
                      <Button
                        onClick={() => handleDownload(mix.id)}
                        variant="outline"
                        className="flex-1 rounded-none border-foreground font-bold uppercase text-xs h-auto py-3 hover:bg-foreground hover:text-background"
                      >
                        Download
                      </Button>
                    </div>
                  </div>

                </div>
              );
            });
          })()}
        </section>

        {/* Footer CTA */}
        <section className="p-12 text-center">
          <h2 className="text-3xl font-black uppercase mb-6">Need a DJ?</h2>
          {isAuthenticated ? (
            <Link href="/bookings">
              <Button size="lg" className="rounded-none bg-foreground text-background hover:bg-accent border border-foreground font-black uppercase tracking-widest text-xl px-12 py-8 h-auto">
                Book Danny
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="rounded-none bg-foreground text-background hover:bg-accent border border-foreground font-black uppercase tracking-widest text-xl px-12 py-8 h-auto">
                Login To Book
              </Button>
            </a>
          )}
        </section>
      </div>
    </>
  );
}
