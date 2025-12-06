import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";

interface Episode {
  id: number;
  title: string;
  description?: string;
  audioUrl: string;
  coverImageUrl?: string;
  duration?: number;
  episodeNumber?: number;
  createdAt: Date;
}

interface PodcastPlayerProps {
  episodes: Episode[];
  currentEpisodeId?: number;
  onEpisodeChange?: (episodeId: number) => void;
}

export function PodcastPlayer({
  episodes,
  currentEpisodeId,
  onEpisodeChange,
}: PodcastPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(
    currentEpisodeId
      ? episodes.findIndex((e) => e.id === currentEpisodeId)
      : 0
  );
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentEpisode = episodes[currentIndex];

  useEffect(() => {
    if (currentEpisodeId) {
      const index = episodes.findIndex((e) => e.id === currentEpisodeId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [currentEpisodeId, episodes]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (currentIndex < episodes.length - 1) {
        nextEpisode();
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentEpisode, currentIndex, episodes.length]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const previousEpisode = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setIsPlaying(false);
      if (onEpisodeChange) {
        onEpisodeChange(episodes[newIndex].id);
      }
    }
  };

  const nextEpisode = () => {
    if (currentIndex < episodes.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setIsPlaying(false);
      if (onEpisodeChange) {
        onEpisodeChange(episodes[newIndex].id);
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentEpisode) {
    return null;
  }

  return (
    <Card className="p-4">
      <audio ref={audioRef} src={currentEpisode.audioUrl} />
      
      <div className="flex items-center gap-4 mb-4">
        {currentEpisode.coverImageUrl && (
          <img
            src={currentEpisode.coverImageUrl}
            alt={currentEpisode.title}
            className="w-16 h-16 rounded object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{currentEpisode.title}</h3>
          {currentEpisode.episodeNumber && (
            <p className="text-sm text-muted-foreground">
              Episode {currentEpisode.episodeNumber}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-20 text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousEpisode}
              disabled={currentIndex === 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={togglePlay}
              className="w-12 h-12 rounded-full"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextEpisode}
              disabled={currentIndex === episodes.length - 1}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0] / 100)}
              className="w-24"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Episode {currentIndex + 1} of {episodes.length}
        </p>
      </div>
    </Card>
  );
}
