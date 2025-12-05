import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Music, Play, Pause, SkipForward, SkipBack, 
  Heart, ExternalLink, Volume2, Shuffle, Repeat,
  Search, ListMusic, User, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

// Spotify track interface
interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: { spotify: string };
}

// Mock Spotify data for demonstration
const mockTracks: SpotifyTrack[] = [
  {
    id: "1",
    name: "Sweet Love",
    artists: [{ name: "Anita Baker" }],
    album: {
      name: "Rapture",
      images: [{ url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300" }],
    },
    duration_ms: 264000,
    preview_url: null,
    external_urls: { spotify: "https://open.spotify.com/track/1" },
  },
  {
    id: "2",
    name: "Flowers",
    artists: [{ name: "Sweet Female Attitude" }],
    album: {
      name: "Flowers",
      images: [{ url: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300" }],
    },
    duration_ms: 224000,
    preview_url: null,
    external_urls: { spotify: "https://open.spotify.com/track/2" },
  },
  {
    id: "3",
    name: "Why",
    artists: [{ name: "Mis-Teeq" }],
    album: {
      name: "Lickin' on Both Sides",
      images: [{ url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300" }],
    },
    duration_ms: 198000,
    preview_url: null,
    external_urls: { spotify: "https://open.spotify.com/track/3" },
  },
];

const mockPlaylists = [
  { id: "1", name: "UK Garage Classics", trackCount: 50, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150" },
  { id: "2", name: "Soulful House", trackCount: 35, image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=150" },
  { id: "3", name: "Amapiano Vibes", trackCount: 42, image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=150" },
];

function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Spotify Connect Widget
export function SpotifyPlayer({ className }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack>(mockTracks[0]);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isLiked, setIsLiked] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("off");

  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= currentTrack.duration_ms) {
            return 0;
          }
          return p + 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const handlePrevious = () => {
    const currentIndex = mockTracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + mockTracks.length) % mockTracks.length;
    setCurrentTrack(mockTracks[prevIndex]);
    setProgress(0);
  };

  const handleNext = () => {
    const currentIndex = mockTracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % mockTracks.length;
    setCurrentTrack(mockTracks[nextIndex]);
    setProgress(0);
  };

  return (
    <Card className={cn("p-4 glass", className)}>
      <div className="flex items-center gap-4">
        {/* Album art */}
        <div className="relative">
          <img
            src={currentTrack.album.images[0]?.url}
            alt={currentTrack.album.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <Music className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{currentTrack.name}</h4>
          <p className="text-sm text-muted-foreground truncate">
            {currentTrack.artists.map(a => a.name).join(", ")}
          </p>
          
          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatDuration(progress)}
            </span>
            <Slider
              value={[progress]}
              max={currentTrack.duration_ms}
              step={1000}
              onValueChange={([v]) => setProgress(v)}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">
              {formatDuration(currentTrack.duration_ms)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShuffle(!shuffle)}
            className={cn(shuffle && "text-green-500")}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handlePrevious}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            className="bg-green-500 hover:bg-green-600"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext}>
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRepeat(repeat === "off" ? "all" : repeat === "all" ? "one" : "off")}
            className={cn(repeat !== "off" && "text-green-500")}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-2 w-32">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={([v]) => setVolume(v)}
          />
        </div>

        {/* Like & External */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-green-500 text-green-500")} />
        </Button>
        <a
          href={currentTrack.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="ghost" size="icon">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </Card>
  );
}

// Spotify Search Component
export function SpotifySearch({ onSelectTrack }: { onSelectTrack?: (track: SpotifyTrack) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setResults(mockTracks.filter(t => 
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.artists.some(a => a.name.toLowerCase().includes(query.toLowerCase()))
    ));
    setLoading(false);
  };

  return (
    <Card className="p-4 glass">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search tracks..."
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((track) => (
            <button
              key={track.id}
              onClick={() => onSelectTrack?.(track)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/10 transition-colors"
            >
              <img
                src={track.album.images[0]?.url}
                alt={track.album.name}
                className="w-10 h-10 rounded"
              />
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{track.name}</p>
                <p className="text-xs text-muted-foreground">
                  {track.artists.map(a => a.name).join(", ")}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDuration(track.duration_ms)}
              </span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

// Playlist Grid
export function SpotifyPlaylists({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-green-500" />
          Featured Playlists
        </h3>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockPlaylists.map((playlist) => (
          <Card
            key={playlist.id}
            className="p-4 glass hover-lift cursor-pointer group"
          >
            <div className="relative mb-3">
              <img
                src={playlist.image}
                alt={playlist.name}
                className="w-full aspect-square rounded-lg object-cover"
              />
              <Button
                size="icon"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-green-500 hover:bg-green-600"
              >
                <Play className="w-4 h-4 text-white ml-0.5" />
              </Button>
            </div>
            <h4 className="font-semibold">{playlist.name}</h4>
            <p className="text-sm text-muted-foreground">
              {playlist.trackCount} tracks
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Recently Played
export function RecentlyPlayed({ className }: { className?: string }) {
  return (
    <Card className={cn("p-4 glass", className)}>
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-green-500" />
        Recently Played
      </h3>
      
      <div className="space-y-2">
        {mockTracks.map((track) => (
          <div
            key={track.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
          >
            <img
              src={track.album.images[0]?.url}
              alt={track.album.name}
              className="w-12 h-12 rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{track.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {track.artists.map(a => a.name).join(", ")}
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <Play className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Spotify Connect Button
export function SpotifyConnectButton() {
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    // In production, this would redirect to Spotify OAuth
    window.open(
      `https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=${encodeURIComponent(window.location.origin + "/callback")}&scope=user-read-playback-state,user-modify-playback-state`,
      "_blank",
      "width=400,height=600"
    );
  };

  return (
    <Button
      onClick={handleConnect}
      className="bg-green-500 hover:bg-green-600"
    >
      <Music className="w-4 h-4 mr-2" />
      {connected ? "Connected to Spotify" : "Connect Spotify"}
    </Button>
  );
}

export default SpotifyPlayer;
