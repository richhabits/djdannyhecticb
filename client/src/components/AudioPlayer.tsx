/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url?: string;
  spotifyUrl?: string;
  soundcloudUrl?: string;
  coverArt?: string;
}

interface AudioPlayerProps {
  tracks: Track[];
  autoPlay?: boolean;
}

export default function AudioPlayer({ tracks, autoPlay = false }: AudioPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [playbackSource, setPlaybackSource] = useState<"spotify" | "soundcloud" | "native">("native");

  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [autoPlay]);

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

  const handleNext = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    }
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
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
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Render Spotify embed if available
  if (currentTrack?.spotifyUrl && playbackSource === "spotify") {
    const spotifyId = currentTrack.spotifyUrl.split("/").pop()?.split("?")[0];
    return (
      <Card className="glass p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{currentTrack.title}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlaybackSource("native")}
            >
              Switch to Native Player
            </Button>
          </div>
          <iframe
            src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-lg"
          />
        </div>
      </Card>
    );
  }

  // Render SoundCloud embed if available
  if (currentTrack?.soundcloudUrl && playbackSource === "soundcloud") {
    return (
      <Card className="glass p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{currentTrack.title}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlaybackSource("native")}
            >
              Switch to Native Player
            </Button>
          </div>
          <iframe
            width="100%"
            height="300"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(currentTrack.soundcloudUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
            className="rounded-lg"
          />
        </div>
      </Card>
    );
  }

  // Native audio player
  return (
    <Card className="glass p-6">
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div className="space-y-6">
        {/* Track Info */}
        <div className="flex items-center gap-4">
          {currentTrack?.coverArt && (
            <img
              src={currentTrack.coverArt}
              alt={currentTrack.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold">{currentTrack?.title || "No Track Selected"}</h3>
            <p className="text-sm text-muted-foreground">{currentTrack?.artist || "DJ Danny Hectic B"}</p>
          </div>
          {currentTrack?.spotifyUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlaybackSource("spotify")}
            >
              Play on Spotify
            </Button>
          )}
          {currentTrack?.soundcloudUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlaybackSource("soundcloud")}
            >
              Play on SoundCloud
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsShuffle(!isShuffle)}
              className={isShuffle ? "text-accent" : ""}
            >
              <Shuffle className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handlePrevious}>
              <SkipBack className="w-6 h-6" />
            </Button>
            <Button
              size="icon"
              className="w-14 h-14 rounded-full gradient-bg"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext}>
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRepeat(!isRepeat)}
              className={isRepeat ? "text-accent" : ""}
            >
              <Repeat className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-32"
          />
        </div>

        {/* Playlist */}
        {tracks.length > 1 && (
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold mb-3">Playlist ({tracks.length} tracks)</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIndex(index);
                    setIsPlaying(true);
                  }}
                  className={`p-3 rounded-lg cursor-pointer smooth-transition ${
                    index === currentTrackIndex
                      ? "bg-accent/20 border border-accent"
                      : "hover:bg-accent/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{track.title}</p>
                      <p className="text-xs text-muted-foreground">{track.artist}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
