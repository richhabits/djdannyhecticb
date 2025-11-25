import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Star,
  Quote,
  Upload,
  Video,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  StopCircle,
  Download,
  Share2,
  Heart,
  ThumbsUp,
  CheckCircle,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { formatDistanceToNow } from 'date-fns';

interface VideoTestimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  rating: number;
  isVerified: boolean;
  isFeatured: boolean;
  likes: number;
  views: number;
  createdAt: string;
  eventType?: string;
  location?: string;
  tags?: string[];
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  videoBlob?: Blob;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export default function VideoTestimonials() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordingVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [testimonials, setTestimonials] = useState<VideoTestimonial[]>([]);
  const [selectedTestimonial, setSelectedTestimonial] = useState<VideoTestimonial | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioEnabled: true,
    videoEnabled: true,
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filter, setFilter] = useState<'all' | 'featured' | 'verified'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('latest');

  // Fetch testimonials
  const { data, isLoading, refetch } = trpc.testimonials.getVideos.useQuery({
    filter,
    sortBy,
    limit: 50,
  });

  // Submit testimonial mutation
  const { mutate: submitTestimonial, isLoading: isSubmitting } = trpc.testimonials.submit.useMutation({
    onSuccess: () => {
      toast.success('Thank you for your testimonial! It will be reviewed and published soon.');
      setShowRecordDialog(false);
      setShowUploadDialog(false);
      refetch();
    },
    onError: (error) => {
      toast.error('Failed to submit testimonial. Please try again.');
      console.error('Testimonial submission error:', error);
    },
  });

  // Like testimonial mutation
  const { mutate: likeTestimonial } = trpc.testimonials.like.useMutation();

  // Initialize testimonials with mock data
  useEffect(() => {
    if (data) {
      setTestimonials(data as VideoTestimonial[]);
    } else {
      // Mock data for demonstration
      const mockTestimonials: VideoTestimonial[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          role: 'Bride',
          company: 'Johnson Wedding',
          content: 'DJ Danny made our wedding absolutely perfect! The music selection was incredible and kept everyone dancing all night. Highly recommend!',
          videoUrl: 'https://example.com/video1.mp4',
          thumbnailUrl: 'https://picsum.photos/400/300?random=1',
          duration: 45,
          rating: 5,
          isVerified: true,
          isFeatured: true,
          likes: 234,
          views: 1520,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          eventType: 'Wedding',
          location: 'London',
          tags: ['Wedding', 'Professional', 'Amazing'],
        },
        {
          id: '2',
          name: 'Michael Chen',
          role: 'Event Organizer',
          company: 'Tech Summit 2024',
          content: 'Outstanding performance at our corporate event. DJ Danny read the room perfectly and created the perfect atmosphere for networking and celebration.',
          videoUrl: 'https://example.com/video2.mp4',
          thumbnailUrl: 'https://picsum.photos/400/300?random=2',
          duration: 60,
          rating: 5,
          isVerified: true,
          isFeatured: false,
          likes: 156,
          views: 892,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          eventType: 'Corporate',
          location: 'Manchester',
          tags: ['Corporate', 'Professional'],
        },
        {
          id: '3',
          name: 'Emma Williams',
          role: 'Birthday Girl',
          company: '',
          content: 'Best DJ ever! My 30th birthday party was unforgettable thanks to DJ Danny. Everyone is still talking about how great the music was!',
          videoUrl: 'https://example.com/video3.mp4',
          thumbnailUrl: 'https://picsum.photos/400/300?random=3',
          duration: 30,
          rating: 5,
          isVerified: false,
          isFeatured: false,
          likes: 89,
          views: 445,
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          eventType: 'Private Party',
          location: 'Birmingham',
          tags: ['Birthday', 'Fun', 'Memorable'],
        },
      ];
      setTestimonials(mockTestimonials);
    }
  }, [data]);

  // Sort and filter testimonials
  const filteredTestimonials = testimonials
    .filter(t => {
      if (filter === 'featured') return t.isFeatured;
      if (filter === 'verified') return t.isVerified;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.views - a.views;
        case 'rating':
          return b.rating - a.rating;
        case 'latest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Video player controls
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    setCurrentTime(video.currentTime);
    setDuration(video.duration);
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  }, []);

  const handleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  }, []);

  // Recording functions
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: recordingState.videoEnabled,
        audio: recordingState.audioEnabled,
      });
      
      streamRef.current = stream;
      
      if (recordingVideoRef.current) {
        recordingVideoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordingState(prev => ({ ...prev, videoBlob: blob }));
      };
      
      mediaRecorder.start();
      setRecordingState(prev => ({ ...prev, isRecording: true, isPaused: false }));
      
      // Start duration timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          setRecordingState(prev => ({
            ...prev,
            duration: Math.floor((Date.now() - startTime) / 1000),
          }));
        } else {
          clearInterval(timer);
        }
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check your camera and microphone permissions.');
    }
  }, [recordingState.videoEnabled, recordingState.audioEnabled]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecordingState(prev => ({ ...prev, isRecording: false }));
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (recordingVideoRef.current) {
      recordingVideoRef.current.srcObject = null;
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !recordingState.audioEnabled;
      });
      setRecordingState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
    }
  }, [recordingState.audioEnabled]);

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !recordingState.videoEnabled;
      });
      setRecordingState(prev => ({ ...prev, videoEnabled: !prev.videoEnabled }));
    }
  }, [recordingState.videoEnabled]);

  // Handle testimonial submission
  const handleSubmitRecording = useCallback(async (formData: any) => {
    if (!recordingState.videoBlob) {
      toast.error('No video recorded');
      return;
    }
    
    // Upload video to storage
    const uploadFormData = new FormData();
    uploadFormData.append('video', recordingState.videoBlob, 'testimonial.webm');
    uploadFormData.append('name', formData.name);
    uploadFormData.append('role', formData.role);
    uploadFormData.append('company', formData.company);
    uploadFormData.append('content', formData.content);
    uploadFormData.append('rating', formData.rating.toString());
    uploadFormData.append('eventType', formData.eventType);
    uploadFormData.append('location', formData.location);
    
    // Track upload progress
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      }
    });
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        submitTestimonial({
          ...formData,
          videoUrl: response.videoUrl,
          thumbnailUrl: response.thumbnailUrl,
          duration: recordingState.duration,
        });
      } else {
        toast.error('Failed to upload video');
      }
      setUploadProgress(0);
    };
    
    xhr.onerror = () => {
      toast.error('Upload failed');
      setUploadProgress(0);
    };
    
    xhr.open('POST', '/api/testimonials/upload');
    xhr.send(uploadFormData);
  }, [recordingState, submitTestimonial]);

  const handleLike = useCallback((testimonialId: string) => {
    likeTestimonial({ id: testimonialId });
    setTestimonials(prev => prev.map(t => 
      t.id === testimonialId 
        ? { ...t, likes: t.likes + 1 }
        : t
    ));
  }, [likeTestimonial]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Video Testimonials</h1>
          <p className="text-muted-foreground">
            Hear what our clients have to say about their experiences
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowUploadDialog(true)}
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
          <Button 
            onClick={() => setShowRecordDialog(true)}
          >
            <Video className="w-4 h-4 mr-2" />
            Record Testimonial
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="all">All Testimonials</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Label htmlFor="sort" className="text-sm">Sort by:</Label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border rounded-md px-2 py-1"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </Tabs>

      {/* Testimonials Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-video w-full" />
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No testimonials found. Be the first to share your experience!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTestimonials.map((testimonial) => (
            <Card 
              key={testimonial.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedTestimonial(testimonial)}
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-black">
                <img 
                  src={testimonial.thumbnailUrl || 'https://picsum.photos/400/300?random=' + testimonial.id}
                  alt={testimonial.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="rounded-full bg-white/90 hover:bg-white text-black"
                  >
                    <Play className="w-6 h-6 ml-1" />
                  </Button>
                </div>
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {formatTime(testimonial.duration)}
                </div>
                {testimonial.isFeatured && (
                  <Badge className="absolute top-2 left-2" variant="default">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Content */}
              <CardContent className="pt-4">
                {/* Author info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={`https://i.pravatar.cc/100?u=${testimonial.id}`} />
                      <AvatarFallback>
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{testimonial.name}</h3>
                        {testimonial.isVerified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      {testimonial.role && (
                        <p className="text-xs text-muted-foreground">
                          {testimonial.role}
                          {testimonial.company && ` at ${testimonial.company}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  "{testimonial.content}"
                </p>

                {/* Event details */}
                {testimonial.eventType && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {testimonial.eventType}
                    </Badge>
                    {testimonial.location && (
                      <Badge variant="outline" className="text-xs">
                        📍 {testimonial.location}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {testimonial.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {testimonial.views}
                    </span>
                  </div>
                  <span>{formatDistanceToNow(new Date(testimonial.createdAt), { addSuffix: true })}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      <Dialog 
        open={!!selectedTestimonial} 
        onOpenChange={(open) => !open && setSelectedTestimonial(null)}
      >
        <DialogContent className="max-w-4xl p-0">
          {selectedTestimonial && (
            <>
              {/* Video Player */}
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  src={selectedTestimonial.videoUrl}
                  className="w-full h-full"
                  onTimeUpdate={handleTimeUpdate}
                  onClick={togglePlayPause}
                />
                
                {/* Controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {/* Progress bar */}
                  <Slider
                    value={[currentTime]}
                    onValueChange={handleSeek}
                    max={duration}
                    step={1}
                    className="mb-3"
                  />
                  
                  {/* Control buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={togglePlayPause}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleLike(selectedTestimonial.id)}
                        className="text-white hover:bg-white/20"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {selectedTestimonial.likes}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleFullscreen}
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={`https://i.pravatar.cc/100?u=${selectedTestimonial.id}`} />
                      <AvatarFallback>
                        {selectedTestimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{selectedTestimonial.name}</h3>
                        {selectedTestimonial.isVerified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      {selectedTestimonial.role && (
                        <p className="text-sm text-muted-foreground">
                          {selectedTestimonial.role}
                          {selectedTestimonial.company && ` at ${selectedTestimonial.company}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.share({
                        title: `Testimonial from ${selectedTestimonial.name}`,
                        text: selectedTestimonial.content,
                        url: window.location.href,
                      }).catch(() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard');
                      });
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < selectedTestimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>

                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <Quote className="w-6 h-6 text-muted-foreground mb-2" />
                  <p className="text-lg italic">{selectedTestimonial.content}</p>
                </div>

                {selectedTestimonial.tags && selectedTestimonial.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTestimonial.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Record Testimonial Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Record Your Testimonial</DialogTitle>
            <DialogDescription>
              Share your experience with DJ Danny Hectic B
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Video preview */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={recordingVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {recordingState.isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">
                    Recording: {formatTime(recordingState.duration)}
                  </span>
                </div>
              )}
              
              {/* Recording controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                {!recordingState.isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleAudio}
                  disabled={!recordingState.isRecording}
                  className="bg-white/90"
                >
                  {recordingState.audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVideo}
                  disabled={!recordingState.isRecording}
                  className="bg-white/90"
                >
                  {recordingState.videoEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Recording tips */}
            {!recordingState.isRecording && !recordingState.videoBlob && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recording Tips:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Find a quiet, well-lit location</li>
                    <li>• Keep your testimonial under 2 minutes</li>
                    <li>• Speak clearly and naturally</li>
                    <li>• Share specific details about your experience</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Form for testimonial details */}
            {recordingState.videoBlob && (
              <TestimonialForm
                onSubmit={(data) => handleSubmitRecording(data)}
                isSubmitting={isSubmitting}
                uploadProgress={uploadProgress}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Testimonial submission form component
function TestimonialForm({ 
  onSubmit, 
  isSubmitting, 
  uploadProgress 
}: { 
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  uploadProgress: number;
}) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    content: '',
    rating: 5,
    eventType: '',
    location: '',
    consent: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      toast.error('Please agree to the terms to submit your testimonial');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Your Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="role">Role/Title</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g., Bride, Event Organizer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Company/Event</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="eventType">Event Type</Label>
          <select
            id="eventType"
            value={formData.eventType}
            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Select event type</option>
            <option value="Wedding">Wedding</option>
            <option value="Corporate">Corporate Event</option>
            <option value="Birthday">Birthday Party</option>
            <option value="Club">Club Night</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="location">Event Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="e.g., London, Manchester"
        />
      </div>

      <div>
        <Label htmlFor="content">Your Testimonial *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Share your experience with DJ Danny..."
          rows={4}
          required
        />
      </div>

      <div>
        <Label>Rating *</Label>
        <div className="flex items-center gap-2 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setFormData({ ...formData, rating: i + 1 })}
              className="p-1"
            >
              <Star 
                className={`w-6 h-6 ${i < formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="consent"
          checked={formData.consent}
          onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="consent" className="text-sm">
          I agree to share my testimonial publicly and understand it may be used for promotional purposes
        </Label>
      </div>

      {uploadProgress > 0 && (
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Uploading video...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting || uploadProgress > 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Testimonial
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}