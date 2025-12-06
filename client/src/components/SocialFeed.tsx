import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Instagram, Twitter, Youtube, Music, ExternalLink, Heart, MessageCircle, Share2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Types for social posts
interface SocialPost {
  id: string;
  platform: "instagram" | "twitter" | "youtube" | "tiktok";
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  likes: number;
  comments: number;
  shares?: number;
  timestamp: string;
  url: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
}

// Mock data for demonstration (in production, fetch from APIs)
const mockPosts: SocialPost[] = [
  {
    id: "1",
    platform: "instagram",
    content: "Live from the studio! 🔥 New garage set dropping tonight. Who's locked in? #HecticRadio #UKGarage",
    mediaUrl: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600",
    mediaType: "image",
    likes: 1247,
    comments: 89,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    url: "https://instagram.com/p/example",
    author: {
      name: "DJ Danny Hectic B",
      handle: "@djdannyhecticb",
      avatar: "/logo-icon.png",
    },
  },
  {
    id: "2",
    platform: "twitter",
    content: "Just dropped a new Amapiano mix on the site 🇿🇦🔊 30 minutes of pure vibes. Link in bio!\n\n#Amapiano #DJLife #HecticRadio",
    likes: 456,
    comments: 34,
    shares: 78,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    url: "https://twitter.com/djdannyhecticb/status/example",
    author: {
      name: "DJ Danny Hectic B",
      handle: "@djdannyhecticb",
      avatar: "/logo-icon.png",
    },
  },
  {
    id: "3",
    platform: "youtube",
    content: "NEW VIDEO: Behind the scenes at our latest studio session. See how the magic happens! 🎬",
    mediaUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600",
    mediaType: "video",
    likes: 2890,
    comments: 156,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    url: "https://youtube.com/watch?v=example",
    author: {
      name: "DJ Danny Hectic B",
      handle: "DJDannyHecticB",
      avatar: "/logo-icon.png",
    },
  },
  {
    id: "4",
    platform: "tiktok",
    content: "When the crowd goes crazy for the drop 🤯 #fyp #djlife #ukgarage",
    mediaUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600",
    mediaType: "video",
    likes: 15600,
    comments: 342,
    shares: 1200,
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    url: "https://tiktok.com/@djdannyhecticb/video/example",
    author: {
      name: "DJ Danny Hectic B",
      handle: "@djdannyhecticb",
      avatar: "/logo-icon.png",
    },
  },
];

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Music,
};

const platformColors = {
  instagram: "from-pink-500 to-purple-500",
  twitter: "from-blue-400 to-blue-500",
  youtube: "from-red-500 to-red-600",
  tiktok: "from-black to-gray-800",
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatTimeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function SocialPostCard({ post }: { post: SocialPost }) {
  const Icon = platformIcons[post.platform];
  const gradient = platformColors[post.platform];

  return (
    <Card className="overflow-hidden glass hover-lift">
      {/* Platform header */}
      <div className={`bg-gradient-to-r ${gradient} p-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2 text-white">
          <Icon className="w-5 h-5" />
          <span className="font-semibold capitalize">{post.platform}</span>
        </div>
        <a 
          href={post.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Author info */}
      <div className="p-4 flex items-center gap-3">
        <img 
          src={post.author.avatar} 
          alt={post.author.name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold text-sm">{post.author.name}</p>
          <p className="text-xs text-muted-foreground">{post.author.handle} · {formatTimeAgo(post.timestamp)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Media */}
      {post.mediaUrl && (
        <div className="relative">
          <img 
            src={post.mediaUrl} 
            alt="Post media"
            className="w-full aspect-video object-cover"
          />
          {post.mediaType === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-black border-b-8 border-b-transparent ml-1" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Engagement */}
      <div className="p-4 flex items-center gap-6 border-t border-border">
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors">
          <Heart className="w-4 h-4" />
          <span className="text-sm">{formatNumber(post.likes)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-blue-500 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{formatNumber(post.comments)}</span>
        </button>
        {post.shares !== undefined && (
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-green-500 transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">{formatNumber(post.shares)}</span>
          </button>
        )}
      </div>
    </Card>
  );
}

function SocialFeedSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-12 w-full" />
      <div className="p-4 flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="px-4 pb-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 flex gap-6">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </Card>
  );
}

export function SocialFeed() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Simulate API fetch
    const fetchPosts = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockPosts);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const filteredPosts = activeTab === "all" 
    ? posts 
    : posts.filter(p => p.platform === activeTab);

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPosts(mockPosts);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">Social Feed</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="instagram">
            <Instagram className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="twitter">
            <Twitter className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="youtube">
            <Youtube className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="tiktok">
            <Music className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <SocialFeedSkeleton key={i} />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No posts to display</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredPosts.map(post => (
                <SocialPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Compact social links widget
export function SocialLinksWidget() {
  const socialLinks = [
    { platform: "instagram", url: "https://instagram.com/djdannyhecticb", followers: "15.2K" },
    { platform: "twitter", url: "https://twitter.com/djdannyhecticb", followers: "8.7K" },
    { platform: "youtube", url: "https://youtube.com/djdannyhecticb", followers: "22.1K" },
    { platform: "tiktok", url: "https://tiktok.com/@djdannyhecticb", followers: "45.3K" },
  ] as const;

  return (
    <div className="flex flex-wrap gap-3">
      {socialLinks.map(({ platform, url, followers }) => {
        const Icon = platformIcons[platform];
        const gradient = platformColors[platform];
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${gradient} text-white hover:opacity-90 transition-opacity`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{followers}</span>
          </a>
        );
      })}
    </div>
  );
}

export default SocialFeed;
