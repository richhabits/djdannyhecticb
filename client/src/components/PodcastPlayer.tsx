import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  ListMusic, Clock, Download, Share2, Heart, 
  ChevronDown, ChevronUp, Shuffle, Repeat, Repeat1
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Episode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  coverImageUrl: string;
  duration: number; // seconds
  publishedAt: string;
  episodeNumber: number;
  season?: number;
  guests?: string[];
  topics?: string[];
}

// Mock episodes
const mockEpisodes: Episode[] = [
  {
    id: "1",
    title: "The Evolution of UK Garage",
    description: "We dive deep into the roots of UK Garage, from its early days to the modern sound. Featuring exclusive stories from the scene.",
    audioUrl: "https://example.com/episode1.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300",
    duration: 3600,
    publishedAt: "2024-01-15",
    episodeNumber: 25,
    season: 2,
    guests: ["MC Creed", "DJ EZ"],
    topics: ["UK Garage", "History", "Culture"],
  },
  {
    id: "2",
    title: "Amapiano: Africa's Gift to the World",
    description: "Exploring the rise of Amapiano from South African townships to global dance floors.",
    audioUrl: "https://example.com/episode2.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=300",
    duration: 2700,
    publishedAt: "2024-01-08",
    episodeNumber: 24,
    season: 2,
    topics: ["Amapiano", "South Africa", "Global Music"],
  },
  {
    id: "3",
    title: "Behind the Decks: Studio Secrets",
    description: "A look at my studio setup, production techniques, and the gear that makes the magic happen.",
    audioUrl: "https://example.com/episode3.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300",
    duration: 2400,
    publishedAt: "2024-01-01",
    episodeNumber: 23,
    season: 2,
    topics: ["Production", "Equipment", "Tutorial"],
  },
];

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface PodcastPlayerProps {
  className?: string;
}

export function PodcastPlayer({ className }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [episodes] = useState<Episode[]>(mockEpisodes);
  const [currentEpisode, setCurrentEpisode] = useState<Episode>(mockEpisodes[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [repeatMode, setRepeatMode] = useState<"none" | "all" | "one">("none");
  const [isShuffled, setIsShuffled] = useState(false);
  const [likedEpisodes, setLikedEpisodes] = useState<Set<string>>(new Set());
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || currentEpisode.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 15, duration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    }
  };

  const playEpisode = (episode: Episode) => {
    setCurrentEpisode(episode);
    setCurrentTime(0);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  const nextEpisode = () => {
    const currentIndex = episodes.findIndex(e => e.id === currentEpisode.id);
    let nextIndex: number;
    
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * episodes.length);
    } else {
      nextIndex = (currentIndex + 1) % episodes.length;
    }
    
    playEpisode(episodes[nextIndex]);
  };

  const previousEpisode = () => {
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    const currentIndex = episodes.findIndex(e => e.id === currentEpisode.id);
    const prevIndex = (currentIndex - 1 + episodes.length) % episodes.length;
    playEpisode(episodes[prevIndex]);
  };

  const toggleLike = (episodeId: string) => {
    setLikedEpisodes(prev => {
      const next = new Set(prev);
      if (next.has(episodeId)) {
        next.delete(episodeId);
      } else {
        next.add(episodeId);
      }
      return next;
    });
  };

  const cycleRepeatMode = () => {
    const modes: ("none" | "all" | "one")[] = ["none", "all", "one"];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const shareEpisode = async (episode: Episode) => {
    if (navigator.share) {
      await navigator.share({
        title: episode.title,
        text: episode.description,
        url: window.location.href,
      });
    }
  };

  const downloadEpisode = (episode: Episode) => {
    const link = document.createElement("a");
    link.href = episode.audioUrl;
    link.download = `${episode.title}.mp3`;
    link.click();
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentEpisode.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={repeatMode === "one" ? () => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          }
        } : nextEpisode}
      />

      {/* Main player */}
      <Card className="p-6 glass">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover image */}
          <div className="relative flex-shrink-0">
            <img
              src={currentEpisode.coverImageUrl}
              alt={currentEpisode.title}
              className="w-full md:w-48 aspect-square object-cover rounded-lg"
            />
            {isPlaying && (
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-accent rounded text-xs font-medium text-white flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Now Playing
              </div>
            )}
          </div>

          {/* Player controls */}
          <div className="flex-1 space-y-4">
            {/* Episode info */}
            <div>
              <p className="text-sm text-accent font-medium mb-1">
                Season {currentEpisode.season} · Episode {currentEpisode.episodeNumber}
              </p>
              <h3 className="text-xl font-bold">{currentEpisode.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {currentEpisode.description}
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || currentEpisode.duration}
                step={1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>-{formatTime((duration || currentEpisode.duration) - currentTime)}</span>
              </div>
            </div>

            {/* Main controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={cn(isShuffled && "text-accent")}
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={previousEpisode}>
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={skipBackward} className="relative">
                  <SkipBack className="w-4 h-4" />
                  <span className="absolute text-[10px] font-medium">15</span>
                </Button>
              </div>

              <Button
                size="lg"
                onClick={togglePlay}
                className="w-14 h-14 rounded-full gradient-bg"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={skipForward} className="relative">
                  <SkipForward className="w-4 h-4" />
                  <span className="absolute text-[10px] font-medium">15</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={nextEpisode}>
                  <SkipForward className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cycleRepeatMode}
                  className={cn(repeatMode !== "none" && "text-accent")}
                >
                  {repeatMode === "one" ? (
                    <Repeat1 className="w-4 h-4" />
                  ) : (
                    <Repeat className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Secondary controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
                    const currentIndex = speeds.indexOf(playbackSpeed);
                    setPlaybackSpeed(speeds[(currentIndex + 1) % speeds.length]);
                  }}
                >
                  {playbackSpeed}x
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleLike(currentEpisode.id)}
                >
                  <Heart className={cn("w-4 h-4", likedEpisodes.has(currentEpisode.id) && "fill-red-500 text-red-500")} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => shareEpisode(currentEpisode)}>
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => downloadEpisode(currentEpisode)}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPlaylist(!showPlaylist)}
                >
                  <ListMusic className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Episode list */}
      {showPlaylist && (
        <Card className="overflow-hidden glass">
          <div className="p-4 border-b border-border">
            <h4 className="font-semibold">All Episodes</h4>
          </div>
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {episodes.map((episode) => (
              <div key={episode.id} className="p-4">
                <div
                  className={cn(
                    "flex items-start gap-4 cursor-pointer",
                    currentEpisode.id === episode.id && "opacity-75"
                  )}
                  onClick={() => playEpisode(episode)}
                >
                  <img
                    src={episode.coverImageUrl}
                    alt={episode.title}
                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-accent font-medium">
                        EP {episode.episodeNumber}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(episode.publishedAt)}
                      </span>
                    </div>
                    <h5 className="font-semibold truncate">{episode.title}</h5>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(episode.duration)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentEpisode.id === episode.id && isPlaying && (
                      <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedEpisode(expandedEpisode === episode.id ? null : episode.id);
                      }}
                    >
                      {expandedEpisode === episode.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {expandedEpisode === episode.id && (
                  <div className="mt-4 pl-20 space-y-3">
                    <p className="text-sm text-muted-foreground">{episode.description}</p>
                    {episode.guests && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Guests: </span>
                        <span className="text-sm">{episode.guests.join(", ")}</span>
                      </div>
                    )}
                    {episode.topics && (
                      <div className="flex flex-wrap gap-2">
                        {episode.topics.map((topic) => (
                          <span key={topic} className="px-2 py-1 text-xs bg-accent/10 text-accent rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default PodcastPlayer;
