import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, AlertCircle, RotateCcw, Repeat } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const FALLBACK_STREAM_URL = import.meta.env.VITE_HECTIC_RADIO_STREAM_URL || "/mixes/amapiano-soulful.mp3";

export function LiveAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(() => {
    try {
      return localStorage.getItem("hectic-autoplay") === "true";
    } catch {
      return false;
    }
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPlayInitialized = useRef(false);

  const { data: activeStream } = trpc.streams.active.useQuery(undefined, {
    retry: false,
    refetchInterval: 10000, // Faster updates for live status
  });

  const { data: streamStats } = trpc.streams.getStats.useQuery(
    { id: activeStream?.id || 0 },
    {
      enabled: !!activeStream?.id && (activeStream.type === 'icecast' || activeStream.type === 'shoutcast'),
      refetchInterval: 5000,
    }
  );

  const streamUrl = activeStream?.publicUrl || FALLBACK_STREAM_URL;

  // Recreate audio element if stream URL changes
  useEffect(() => {
    if (audioRef.current && audioRef.current.src !== streamUrl) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      if (wasPlaying && streamUrl) {
        // Small delay to recreate
        setTimeout(() => {
          if (streamUrl) {
            const newAudio = new Audio(streamUrl);
            newAudio.crossOrigin = "anonymous";
            newAudio.volume = isMuted ? 0 : volume;
            audioRef.current = newAudio;
            setupAudioListeners(newAudio);
            if (wasPlaying) {
              newAudio.play().catch(console.error);
            }
          }
        }, 100);
        return;
      }
    }

    // Create audio element if it doesn't exist
    if (!audioRef.current && streamUrl) {
      audioRef.current = new Audio(streamUrl);
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.volume = volume;
      setupAudioListeners(audioRef.current);
    }
  }, [streamUrl]);

  const setupAudioListeners = (audio: HTMLAudioElement) => {
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        setIsPlaying(false);
      }
    };
    const handleError = (e: Event) => {
      console.error("[AudioPlayer] Error:", e);
      setIsPlaying(false);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Auto-play on mount if enabled
  useEffect(() => {
    if (!autoPlayInitialized.current && isAutoPlayEnabled && streamUrl && audioRef.current && !isPlaying) {
      autoPlayInitialized.current = true;
      setTimeout(() => {
        audioRef.current?.play().catch(() => {
          console.log("[AudioPlayer] Auto-play prevented by browser");
        });
      }, 500);
    }
  }, [isAutoPlayEnabled, streamUrl, isPlaying]);

  const togglePlay = () => {
    if (!streamUrl) {
      console.warn("[AudioPlayer] No stream URL configured");
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(streamUrl);
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.volume = isMuted ? 0 : volume;
      setupAudioListeners(audioRef.current);
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("[AudioPlayer] Play failed:", error);
        setIsPlaying(false);
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const rewindStream = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const toggleAutoPlay = () => {
    const newState = !isAutoPlayEnabled;
    setIsAutoPlayEnabled(newState);
    try {
      localStorage.setItem("hectic-autoplay", newState ? "true" : "false");
    } catch {
      console.warn("[AudioPlayer] Could not save auto-play preference");
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-card/95 backdrop-blur-xl border-t border-border",
        "shadow-lg"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="shrink-0"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>

          {/* Rewind Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={rewindStream}
            className="shrink-0"
            title="Rewind 10s"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {/* Loop Button */}
          <Button
            variant={isLooping ? "default" : "ghost"}
            size="icon"
            onClick={toggleLoop}
            className="shrink-0"
            title={isLooping ? "Loop: ON" : "Loop: OFF"}
          >
            <Repeat className="w-4 h-4" />
          </Button>

          {/* Auto-Play Toggle */}
          <Button
            variant={isAutoPlayEnabled ? "default" : "ghost"}
            size="sm"
            onClick={toggleAutoPlay}
            className="shrink-0 text-xs"
            title={isAutoPlayEnabled ? "Auto-play: ON" : "Auto-play: OFF"}
          >
            {isAutoPlayEnabled ? "🔊 AUTO" : "AUTO"}
          </Button>

          {/* Live Label */}
          <div className="flex items-center gap-2 shrink-0">
            {streamUrl ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/50">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-orange-500">
                    LIVE NOW
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground hidden sm:inline">
                  {(activeStream as any)?.showName ? (
                    <>
                      <span className="font-bold text-orange-400">{(activeStream as any).showName}</span>
                      <span className="mx-1 text-muted-foreground">with</span>
                      <span className="text-amber-400">{(activeStream as any).hostName || "Danny Hectic"}</span>
                      {streamStats && (
                        <span className="ml-3 text-xs text-muted-foreground border-l border-border pl-3">
                          🎵 {streamStats.currentTrack} <span className="mx-1">•</span> 👥 {streamStats.listeners} locked in
                        </span>
                      )}
                    </>
                  ) : (
                    activeStream ? `on ${activeStream.name}` : "on Hectic Radio"
                  )}
                </span>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Stream not configured
                </span>
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="shrink-0"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.01}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-right shrink-0">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

