import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, ThumbsUp, MessageCircle, Share2, 
  Eye, Clock, ExternalLink, Youtube, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  publishedAt: string;
  channelName: string;
  channelAvatar: string;
}

// Mock YouTube data
const mockVideos: YouTubeVideo[] = [
  {
    id: "video1",
    title: "Live from the Studio - UK Garage Classics Set",
    description: "Join me for a live session playing the best UK Garage classics. Let me know your requests in the chat!",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
    views: 15420,
    likes: 892,
    comments: 156,
    duration: "1:24:35",
    publishedAt: "2024-01-15",
    channelName: "DJ Danny Hectic B",
    channelAvatar: "/logo-icon.png",
  },
  {
    id: "video2",
    title: "How to Mix Amapiano - Beginner Tutorial",
    description: "Learn the basics of mixing Amapiano with this step-by-step tutorial. Perfect for DJs looking to expand their style.",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600",
    views: 8734,
    likes: 567,
    comments: 89,
    duration: "18:42",
    publishedAt: "2024-01-10",
    channelName: "DJ Danny Hectic B",
    channelAvatar: "/logo-icon.png",
  },
  {
    id: "video3",
    title: "Ministry of Sound - Full Set Recording",
    description: "Recorded live at Ministry of Sound. 2 hours of pure energy!",
    thumbnail: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=600",
    views: 32150,
    likes: 2104,
    comments: 342,
    duration: "2:15:20",
    publishedAt: "2024-01-05",
    channelName: "DJ Danny Hectic B",
    channelAvatar: "/logo-icon.png",
  },
];

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

// Video Card Component
function VideoCard({ video, variant = "grid" }: { video: YouTubeVideo; variant?: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <div className="flex gap-4 p-2 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer">
        <div className="relative flex-shrink-0">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-40 aspect-video rounded-lg object-cover"
          />
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
            {video.duration}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold line-clamp-2">{video.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {formatNumber(video.views)} views · {formatDate(video.publishedAt)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <img
              src={video.channelAvatar}
              alt={video.channelName}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-muted-foreground">{video.channelName}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden glass hover-lift cursor-pointer">
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover"
        />
        <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
          {video.duration}
        </span>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex gap-3">
          <img
            src={video.channelAvatar}
            alt={video.channelName}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold line-clamp-2 text-sm">{video.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{video.channelName}</p>
            <p className="text-xs text-muted-foreground">
              {formatNumber(video.views)} views · {formatDate(video.publishedAt)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// YouTube Video Embed
export function YouTubeEmbed({ 
  videoId, 
  title,
  className 
}: { 
  videoId: string; 
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("aspect-video rounded-lg overflow-hidden", className)}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title || "YouTube video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

// YouTube Video Player with Info
export function YouTubeVideoPlayer({ video }: { video: YouTubeVideo }) {
  const [subscribed, setSubscribed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);

  const handleLike = () => {
    if (liked) {
      setLikeCount(c => c - 1);
    } else {
      setLikeCount(c => c + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className="space-y-4">
      <YouTubeEmbed videoId={video.id} title={video.title} />
      
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{video.title}</h2>
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={video.channelAvatar}
              alt={video.channelName}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-semibold">{video.channelName}</p>
              <p className="text-sm text-muted-foreground">25K subscribers</p>
            </div>
            <Button
              onClick={() => setSubscribed(!subscribed)}
              variant={subscribed ? "outline" : "default"}
              className={cn(!subscribed && "bg-red-600 hover:bg-red-700")}
            >
              {subscribed ? (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Subscribed
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleLike}
              className={cn(liked && "bg-accent/20")}
            >
              <ThumbsUp className={cn("w-4 h-4 mr-2", liked && "fill-current")} />
              {formatNumber(likeCount)}
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                YouTube
              </Button>
            </a>
          </div>
        </div>

        <Card className="p-4 bg-card/50">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatNumber(video.views)} views
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(video.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {formatNumber(video.comments)} comments
            </span>
          </div>
          <p className="text-sm">{video.description}</p>
        </Card>
      </div>
    </div>
  );
}

// YouTube Channel Feed
export function YouTubeFeed({ className }: { className?: string }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Youtube className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold">Latest Videos</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockVideos.map((video) => (
            <VideoCard key={video.id} video={video} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {mockVideos.map((video) => (
            <VideoCard key={video.id} video={video} variant="list" />
          ))}
        </div>
      )}

      <div className="text-center">
        <a
          href="https://www.youtube.com/@djdannyhecticb"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline">
            <Youtube className="w-4 h-4 mr-2 text-red-600" />
            View Channel on YouTube
          </Button>
        </a>
      </div>
    </div>
  );
}

// Live Stream Widget
export function LiveStreamWidget({ className }: { className?: string }) {
  const [isLive, setIsLive] = useState(true);

  if (!isLive) return null;

  return (
    <Card className={cn("p-4 glass border-red-500/50", className)}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <Youtube className="w-8 h-8 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-medium rounded">
              LIVE
            </span>
            <span className="text-sm text-muted-foreground">1,234 watching</span>
          </div>
          <p className="font-semibold">Live Stream: Saturday Night Sessions</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Play className="w-4 h-4 mr-2" />
          Watch Live
        </Button>
      </div>
    </Card>
  );
}

export default YouTubeFeed;
