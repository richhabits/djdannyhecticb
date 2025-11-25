import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Download,
  Share2,
  Heart,
  Clock,
  Mic,
  Radio,
  ChevronUp,
  ChevronDown,
  List,
  Shuffle,
  Repeat,
  MoreVertical,
  X,
  Loader2,
  Headphones,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { formatDistanceToNow } from 'date-fns';

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number; // in seconds
  publishedAt: string;
  episodeNumber?: number;
  season?: number;
  imageUrl?: string;
  transcript?: string;
  chapters?: Chapter[];
  guests?: Guest[];
  tags?: string[];
  downloadUrl?: string;
  stats: {
    plays: number;
    likes: number;
    downloads: number;
    shares: number;
  };
}

interface Chapter {
  title: string;
  startTime: number;
  endTime: number;
  description?: string;
}

interface Guest {
  name: string;
  bio?: string;
  imageUrl?: string;
  social?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  playbackRate: number;
  isRepeat: boolean;
  isShuffle: boolean;
}

export default function PodcastPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressAnimationRef = useRef<number>();
  
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [playlist, setPlaylist] = useState<PodcastEpisode[]>([]);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isLoading: false,
    playbackRate: 1,
    isRepeat: false,
    isShuffle: false,
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [likedEpisodes, setLikedEpisodes] = useState<Set<string>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  // Fetch podcast episodes
  const { data: episodes, isLoading } = trpc.podcast.getEpisodes.useQuery({
    limit: 50,
    sortBy: 'latest',
  });

  // Subscribe to episode updates via WebSocket
  const { mutate: subscribeToUpdates } = trpc.podcast.subscribeToUpdates.useMutation();

  // Analytics tracking
  const { mutate: trackPlay } = trpc.podcast.trackPlay.useMutation();
  const { mutate: trackProgress } = trpc.podcast.trackProgress.useMutation();

  // Initialize playlist
  useEffect(() => {
    if (episodes) {
      setPlaylist(episodes as PodcastEpisode[]);
      if (episodes.length > 0 && !currentEpisode) {
        setCurrentEpisode(episodes[0] as PodcastEpisode);
      }
    }
  }, [episodes, currentEpisode]);

  // Audio element event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
      }));
    };

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    const handleEnded = () => {
      if (playerState.isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    const handlePlay = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
      if (currentEpisode) {
        trackPlay({ episodeId: currentEpisode.id });
      }
    };

    const handlePause = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      if (currentEpisode) {
        trackProgress({ 
          episodeId: currentEpisode.id, 
          progress: Math.floor((audio.currentTime / audio.duration) * 100) 
        });
      }
    };

    const handleLoadStart = () => {
      setPlayerState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setPlayerState(prev => ({ ...prev, isLoading: false }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentEpisode, playerState.isRepeat]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          setIsExpanded(!isExpanded);
          break;
        case 'l':
          toggleLike();
          break;
        case 'n':
          handleNext();
          break;
        case 'p':
          handlePrevious();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isExpanded]);

  // Player controls
  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    if (playerState.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }, [playerState.isPlaying, currentEpisode]);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration));
    audio.currentTime = newTime;
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = time;
  }, []);

  const changeVolume = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = Math.max(0, Math.min(1, audio.volume + delta));
    audio.volume = newVolume;
    setPlayerState(prev => ({ ...prev, volume: newVolume, isMuted: newVolume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (playerState.isMuted) {
      audio.volume = playerState.volume || 0.5;
      setPlayerState(prev => ({ ...prev, isMuted: false }));
    } else {
      audio.volume = 0;
      setPlayerState(prev => ({ ...prev, isMuted: true }));
    }
  }, [playerState.isMuted, playerState.volume]);

  const setPlaybackRate = useCallback((rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.playbackRate = rate;
    setPlayerState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  const handleNext = useCallback(() => {
    if (!playlist.length) return;
    
    const currentIndex = playlist.findIndex(ep => ep.id === currentEpisode?.id);
    let nextIndex: number;
    
    if (playerState.isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    
    const nextEpisode = playlist[nextIndex];
    playEpisode(nextEpisode);
  }, [playlist, currentEpisode, playerState.isShuffle]);

  const handlePrevious = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !playlist.length) return;
    
    // If more than 3 seconds into the episode, restart it
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    
    const currentIndex = playlist.findIndex(ep => ep.id === currentEpisode?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    const prevEpisode = playlist[prevIndex];
    playEpisode(prevEpisode);
  }, [playlist, currentEpisode]);

  const playEpisode = useCallback((episode: PodcastEpisode) => {
    setCurrentEpisode(episode);
    setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    
    // Reset audio element
    const audio = audioRef.current;
    if (audio) {
      audio.src = episode.audioUrl;
      audio.load();
      audio.play();
    }
  }, []);

  const toggleLike = useCallback(() => {
    if (!currentEpisode) return;
    
    setLikedEpisodes(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(currentEpisode.id)) {
        newLikes.delete(currentEpisode.id);
        toast.success('Removed from favorites');
      } else {
        newLikes.add(currentEpisode.id);
        toast.success('Added to favorites');
      }
      return newLikes;
    });
  }, [currentEpisode]);

  const downloadEpisode = useCallback(async (episode: PodcastEpisode) => {
    if (!episode.downloadUrl) {
      toast.error('Download not available for this episode');
      return;
    }

    try {
      setDownloadProgress(prev => ({ ...prev, [episode.id]: 0 }));
      
      const response = await fetch(episode.downloadUrl);
      const reader = response.body?.getReader();
      const contentLength = +(response.headers.get('Content-Length') ?? 0);
      
      let receivedLength = 0;
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader!.read();
        
        if (done) break;
        
        chunks.push(value!);
        receivedLength += value!.length;
        
        const progress = Math.round((receivedLength / contentLength) * 100);
        setDownloadProgress(prev => ({ ...prev, [episode.id]: progress }));
      }
      
      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${episode.title.replace(/[^a-z0-9]/gi, '_')}.mp3`;
      a.click();
      
      toast.success(`Downloaded: ${episode.title}`);
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[episode.id];
        return newProgress;
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download episode');
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[episode.id];
        return newProgress;
      });
    }
  }, []);

  const shareEpisode = useCallback((episode: PodcastEpisode) => {
    if (navigator.share) {
      navigator.share({
        title: episode.title,
        text: episode.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  }, []);

  const jumpToChapter = useCallback((chapter: Chapter) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = chapter.startTime;
    if (!playerState.isPlaying) {
      audio.play();
    }
  }, [playerState.isPlaying]);

  // Format time display
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current chapter
  const getCurrentChapter = useCallback((): Chapter | null => {
    if (!currentEpisode?.chapters) return null;
    
    return currentEpisode.chapters.find(
      chapter => playerState.currentTime >= chapter.startTime && 
                 playerState.currentTime < chapter.endTime
    ) || null;
  }, [currentEpisode, playerState.currentTime]);

  const currentChapter = getCurrentChapter();

  if (isLoading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentEpisode) {
    return null;
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio 
        ref={audioRef}
        src={currentEpisode.audioUrl}
        preload="metadata"
      />

      {/* Minimized Player Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-background border-t transition-transform ${isExpanded ? 'translate-y-full' : ''}`}>
        <div className="container mx-auto px-4 py-2">
          {/* Progress bar */}
          <Progress 
            value={(playerState.currentTime / playerState.duration) * 100 || 0}
            className="h-1 mb-2"
          />
          
          <div className="flex items-center gap-4">
            {/* Episode info */}
            <div className="flex items-center gap-3 flex-1">
              <img 
                src={currentEpisode.imageUrl || '/podcast-cover.jpg'} 
                alt={currentEpisode.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-medium truncate">
                  {currentEpisode.title}
                  {currentEpisode.episodeNumber && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Ep {currentEpisode.episodeNumber}
                    </Badge>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {currentChapter ? currentChapter.title : 'DJ Danny Hectic B Podcast'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handlePrevious}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => skip(-10)}
                className="hidden sm:flex"
              >
                <span className="text-xs">-10</span>
              </Button>
              
              <Button 
                variant="default" 
                size="icon"
                onClick={togglePlayPause}
                disabled={playerState.isLoading}
              >
                {playerState.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : playerState.isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => skip(30)}
                className="hidden sm:flex"
              >
                <span className="text-xs">+30</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleNext}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Time display */}
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatTime(playerState.currentTime)}</span>
              <span>/</span>
              <span>{formatTime(playerState.duration)}</span>
            </div>

            {/* Volume control */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
              >
                {playerState.isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Slider
                value={[playerState.isMuted ? 0 : playerState.volume]}
                onValueChange={([value]) => {
                  const audio = audioRef.current;
                  if (audio) {
                    audio.volume = value;
                    setPlayerState(prev => ({ 
                      ...prev, 
                      volume: value,
                      isMuted: value === 0 
                    }));
                  }
                }}
                max={1}
                step={0.05}
                className="w-24"
              />
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLike}
              >
                <Heart className={`w-4 h-4 ${likedEpisodes.has(currentEpisode.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPlaylist(!showPlaylist)}
              >
                <List className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPlaybackRate(0.5)}>
                    0.5x Speed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlaybackRate(0.75)}>
                    0.75x Speed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlaybackRate(1)}>
                    1x Speed (Normal)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlaybackRate(1.25)}>
                    1.25x Speed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlaybackRate(1.5)}>
                    1.5x Speed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlaybackRate(2)}>
                    2x Speed
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowTranscript(true)}>
                    <Mic className="w-4 h-4 mr-2" />
                    View Transcript
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadEpisode(currentEpisode)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Episode
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareEpisode(currentEpisode)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Episode
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setPlayerState(prev => ({ ...prev, isRepeat: !prev.isRepeat }))}>
                    <Repeat className={`w-4 h-4 mr-2 ${playerState.isRepeat ? 'text-primary' : ''}`} />
                    Repeat {playerState.isRepeat ? 'On' : 'Off'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlayerState(prev => ({ ...prev, isShuffle: !prev.isShuffle }))}>
                    <Shuffle className={`w-4 h-4 mr-2 ${playerState.isShuffle ? 'text-primary' : ''}`} />
                    Shuffle {playerState.isShuffle ? 'On' : 'Off'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Player View */}
      <Sheet open={isExpanded} onOpenChange={setIsExpanded}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                <h3 className="font-semibold">Now Playing</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 max-w-4xl mx-auto">
                {/* Episode artwork and info */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  <img 
                    src={currentEpisode.imageUrl || '/podcast-cover.jpg'}
                    alt={currentEpisode.title}
                    className="w-full md:w-64 h-64 rounded-xl object-cover"
                  />
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      {currentEpisode.title}
                    </h2>
                    {currentEpisode.episodeNumber && (
                      <div className="flex items-center gap-2 mb-3">
                        <Badge>Episode {currentEpisode.episodeNumber}</Badge>
                        {currentEpisode.season && (
                          <Badge variant="secondary">Season {currentEpisode.season}</Badge>
                        )}
                      </div>
                    )}
                    <p className="text-muted-foreground mb-4">
                      {currentEpisode.description}
                    </p>
                    
                    {/* Episode stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(playerState.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Headphones className="w-4 h-4" />
                        {currentEpisode.stats.plays.toLocaleString()} plays
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {currentEpisode.stats.likes.toLocaleString()} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {currentEpisode.stats.downloads.toLocaleString()} downloads
                      </span>
                    </div>
                    
                    {/* Tags */}
                    {currentEpisode.tags && currentEpisode.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {currentEpisode.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress and time */}
                <div className="mb-6">
                  <Slider
                    value={[playerState.currentTime]}
                    onValueChange={([value]) => seekTo(value)}
                    max={playerState.duration}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(playerState.currentTime)}</span>
                    <span>{currentChapter?.title}</span>
                    <span>{formatTime(playerState.duration)}</span>
                  </div>
                </div>

                {/* Playback controls */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPlayerState(prev => ({ ...prev, isShuffle: !prev.isShuffle }))}
                  >
                    <Shuffle className={`w-5 h-5 ${playerState.isShuffle ? 'text-primary' : ''}`} />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevious}
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => skip(-10)}
                  >
                    <span className="text-sm">-10</span>
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={togglePlayPause}
                    disabled={playerState.isLoading}
                    className="w-16 h-16"
                  >
                    {playerState.isLoading ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : playerState.isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => skip(30)}
                  >
                    <span className="text-sm">+30</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPlayerState(prev => ({ ...prev, isRepeat: !prev.isRepeat }))}
                  >
                    <Repeat className={`w-5 h-5 ${playerState.isRepeat ? 'text-primary' : ''}`} />
                  </Button>
                </div>

                {/* Tabs for additional content */}
                <Tabs defaultValue="chapters" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="chapters">Chapters</TabsTrigger>
                    <TabsTrigger value="guests">Guests</TabsTrigger>
                    <TabsTrigger value="related">Related</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chapters" className="mt-4">
                    {currentEpisode.chapters && currentEpisode.chapters.length > 0 ? (
                      <div className="space-y-2">
                        {currentEpisode.chapters.map((chapter, idx) => {
                          const isActive = currentChapter === chapter;
                          return (
                            <button
                              key={idx}
                              onClick={() => jumpToChapter(chapter)}
                              className={`w-full text-left p-3 rounded-lg transition-colors ${
                                isActive ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-muted'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                                    {chapter.title}
                                  </h4>
                                  {chapter.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {chapter.description}
                                    </p>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(chapter.startTime)}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No chapters available for this episode
                      </p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="guests" className="mt-4">
                    {currentEpisode.guests && currentEpisode.guests.length > 0 ? (
                      <div className="space-y-4">
                        {currentEpisode.guests.map((guest, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={guest.imageUrl} />
                              <AvatarFallback>
                                {guest.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium">{guest.name}</h4>
                              {guest.bio && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {guest.bio}
                                </p>
                              )}
                              {guest.social && (
                                <div className="flex items-center gap-2 mt-2">
                                  {guest.social.twitter && (
                                    <a 
                                      href={`https://twitter.com/${guest.social.twitter}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline"
                                    >
                                      @{guest.social.twitter}
                                    </a>
                                  )}
                                  {guest.social.website && (
                                    <a 
                                      href={guest.social.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      Website
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No guest information available
                      </p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="related" className="mt-4">
                    <div className="space-y-2">
                      {playlist.filter(ep => ep.id !== currentEpisode.id).slice(0, 5).map(episode => (
                        <button
                          key={episode.id}
                          onClick={() => playEpisode(episode)}
                          className="w-full p-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                        >
                          <img 
                            src={episode.imageUrl || '/podcast-cover.jpg'}
                            alt={episode.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1 text-left">
                            <h4 className="font-medium text-sm">{episode.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(episode.duration)} • {formatDistanceToNow(new Date(episode.publishedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Playlist sidebar */}
      <Sheet open={showPlaylist} onOpenChange={setShowPlaylist}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Episode Playlist</SheetTitle>
            <SheetDescription>
              {playlist.length} episodes available
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-120px)] mt-4">
            <div className="space-y-2">
              {playlist.map((episode, idx) => {
                const isCurrentEpisode = episode.id === currentEpisode.id;
                const isDownloading = downloadProgress[episode.id] !== undefined;
                
                return (
                  <div
                    key={episode.id}
                    className={`p-3 rounded-lg transition-colors ${
                      isCurrentEpisode ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => playEpisode(episode)}
                        className="flex-1 text-left"
                      >
                        <h4 className={`font-medium text-sm ${isCurrentEpisode ? 'text-primary' : ''}`}>
                          {idx + 1}. {episode.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(episode.duration)} • {formatDistanceToNow(new Date(episode.publishedAt), { addSuffix: true })}
                        </p>
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {isCurrentEpisode && playerState.isPlaying && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => downloadEpisode(episode)}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <span className="text-xs">{downloadProgress[episode.id]}%</span>
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {isDownloading && (
                      <Progress 
                        value={downloadProgress[episode.id]} 
                        className="h-1 mt-2"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Transcript modal */}
      <Sheet open={showTranscript} onOpenChange={setShowTranscript}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Episode Transcript</SheetTitle>
            <SheetDescription>
              {currentEpisode.title}
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-120px)] mt-4">
            {currentEpisode.transcript ? (
              <div className="prose prose-sm dark:prose-invert">
                <p className="whitespace-pre-wrap">{currentEpisode.transcript}</p>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Transcript not available for this episode
              </p>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}