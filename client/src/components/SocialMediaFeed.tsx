import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Music2,
  Heart,
  MessageCircle,
  Share2,
  Play,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'tiktok';
  type: 'post' | 'video' | 'story' | 'reel' | 'short';
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink: string;
  likes: number;
  comments: number;
  shares?: number;
  views?: number;
  createdAt: string;
  author: {
    name: string;
    username: string;
    avatarUrl?: string;
  };
  hashtags?: string[];
  mentions?: string[];
  isLive?: boolean;
}

interface PlatformConfig {
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  enabled: boolean;
}

const platformConfigs: Record<string, PlatformConfig> = {
  instagram: {
    name: 'Instagram',
    icon: <Instagram className="w-4 h-4" />,
    color: 'text-pink-600',
    bgColor: 'bg-gradient-to-br from-purple-600 to-pink-600',
    enabled: true,
  },
  facebook: {
    name: 'Facebook',
    icon: <Facebook className="w-4 h-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-600',
    enabled: true,
  },
  twitter: {
    name: 'Twitter',
    icon: <Twitter className="w-4 h-4" />,
    color: 'text-sky-500',
    bgColor: 'bg-sky-500',
    enabled: true,
  },
  youtube: {
    name: 'YouTube',
    icon: <Youtube className="w-4 h-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-600',
    enabled: true,
  },
  tiktok: {
    name: 'TikTok',
    icon: <Music2 className="w-4 h-4" />,
    color: 'text-black',
    bgColor: 'bg-black',
    enabled: true,
  },
};

export default function SocialMediaFeed() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  // Fetch social media posts
  const { data: socialData, refetch, isRefetching } = trpc.social.getFeed.useQuery(
    { 
      platform: selectedPlatform === 'all' ? undefined : selectedPlatform,
      limit: 50,
    },
    {
      refetchInterval: autoRefresh ? 60000 : false, // Auto-refresh every minute
      onSuccess: (data) => {
        setPosts(data as SocialPost[]);
        setLoading(false);
      },
      onError: (error) => {
        console.error('Error fetching social feed:', error);
        setLoading(false);
      },
    }
  );

  // Mock data for demonstration (replace with real API calls)
  useEffect(() => {
    if (!socialData) {
      // Generate mock posts for demonstration
      const mockPosts: SocialPost[] = [
        {
          id: '1',
          platform: 'instagram',
          type: 'post',
          content: '🎵 Last night at Fabric was absolutely mental! Thank you to everyone who came through! #UKGarage #House #DJLife',
          mediaUrl: 'https://picsum.photos/400/400?random=1',
          permalink: 'https://instagram.com/p/abc123',
          likes: 1234,
          comments: 56,
          shares: 23,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          author: {
            name: 'DJ Danny Hectic B',
            username: 'djdannyhectib',
            avatarUrl: '/dj-danny-bio.jpg',
          },
          hashtags: ['#UKGarage', '#House', '#DJLife'],
        },
        {
          id: '2',
          platform: 'youtube',
          type: 'video',
          content: 'New Mix Alert! 2 Hour Garage & Soulful House Journey 🔥',
          thumbnailUrl: 'https://picsum.photos/600/400?random=2',
          permalink: 'https://youtube.com/watch?v=xyz789',
          likes: 892,
          comments: 127,
          views: 15420,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          author: {
            name: 'DJ Danny Hectic B',
            username: 'DJDannyHecticB',
          },
        },
        {
          id: '3',
          platform: 'facebook',
          type: 'post',
          content: 'Excited to announce I\'ll be playing at the Summer Music Festival next month! Early bird tickets available now 🎫',
          permalink: 'https://facebook.com/djdannyhectib/posts/123',
          likes: 567,
          comments: 89,
          shares: 45,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          author: {
            name: 'DJ Danny Hectic B',
            username: 'djdannyhectib',
          },
        },
        {
          id: '4',
          platform: 'twitter',
          type: 'post',
          content: 'Studio vibes today 🎧 Working on something special for you lot! What genre should I explore next?',
          permalink: 'https://twitter.com/djdannyhectib/status/123',
          likes: 234,
          comments: 45,
          shares: 12,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          author: {
            name: 'DJ Danny Hectic B',
            username: '@djdannyhectib',
          },
        },
        {
          id: '5',
          platform: 'tiktok',
          type: 'short',
          content: 'Quick mix tutorial: How to blend Garage with Amapiano 🎵',
          thumbnailUrl: 'https://picsum.photos/400/600?random=3',
          permalink: 'https://tiktok.com/@djdannyhectib/video/123',
          likes: 8923,
          comments: 342,
          shares: 567,
          views: 45000,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          author: {
            name: 'DJ Danny Hectic B',
            username: '@djdannyhectib',
          },
        },
        {
          id: '6',
          platform: 'instagram',
          type: 'story',
          content: 'Live from the studio! Join me on Instagram Live in 5 minutes 🔴',
          mediaUrl: 'https://picsum.photos/400/600?random=4',
          permalink: 'https://instagram.com/stories/djdannyhectib/123',
          likes: 456,
          views: 2340,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          author: {
            name: 'DJ Danny Hectic B',
            username: 'djdannyhectib',
          },
          isLive: true,
        },
      ];

      setPosts(mockPosts);
      setLoading(false);
    }
  }, [socialData]);

  // Filter posts by platform
  const filteredPosts = selectedPlatform === 'all' 
    ? posts 
    : posts.filter(post => post.platform === selectedPlatform);

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success('Feed refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh feed');
    } finally {
      setRefreshing(false);
    }
  };

  // Format engagement numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Render post media
  const renderMedia = (post: SocialPost) => {
    if (post.type === 'video' || post.type === 'short') {
      return (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
          {post.thumbnailUrl && (
            <img 
              src={post.thumbnailUrl} 
              alt={post.content}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-black ml-1" />
            </div>
          </div>
        </div>
      );
    }
    
    if (post.mediaUrl) {
      return (
        <img 
          src={post.mediaUrl} 
          alt={post.content}
          className="w-full rounded-lg"
        />
      );
    }
    
    return null;
  };

  // Render single post
  const renderPost = (post: SocialPost) => {
    const platform = platformConfigs[post.platform];
    
    return (
      <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.author.avatarUrl} />
                <AvatarFallback className={platform.bgColor}>
                  {platform.icon}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{post.author.name}</span>
                  {post.isLive && (
                    <Badge variant="destructive" className="text-xs">
                      LIVE
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className={platform.color}>{platform.icon}</span>
                  <span>{post.author.username}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              asChild
            >
              <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Post content */}
          <p className="text-sm whitespace-pre-wrap">{post.content}</p>
          
          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.hashtags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Media */}
          {renderMedia(post)}
          
          {/* Engagement stats */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-sm hover:text-primary transition-colors">
                <Heart className="w-4 h-4" />
                <span>{formatNumber(post.likes)}</span>
              </button>
              <button className="flex items-center gap-1 text-sm hover:text-primary transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>{formatNumber(post.comments)}</span>
              </button>
              {post.shares !== undefined && (
                <button className="flex items-center gap-1 text-sm hover:text-primary transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>{formatNumber(post.shares)}</span>
                </button>
              )}
            </div>
            {post.views !== undefined && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>{formatNumber(post.views)} views</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold">Social Media Feed</h2>
          <p className="text-muted-foreground mt-1">
            Stay updated with DJ Danny's latest posts across all platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'text-green-600' : ''}
          >
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || isRefetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing || isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Platform filter tabs */}
      <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="mb-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All Platforms</TabsTrigger>
          {Object.entries(platformConfigs).map(([key, config]) => (
            <TabsTrigger key={key} value={key} disabled={!config.enabled}>
              <span className={`flex items-center gap-2 ${config.color}`}>
                {config.icon}
                <span className="hidden sm:inline">{config.name}</span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Posts feed */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 mb-3" />
                <Skeleton className="aspect-square" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No posts available for the selected platform. Check back later or try a different platform.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map(renderPost)}
        </div>
      )}

      {/* Live indicator */}
      {posts.some(p => p.isLive) && (
        <div className="fixed bottom-6 right-6 z-50">
          <Badge variant="destructive" className="px-4 py-2 text-sm animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
            LIVE NOW
          </Badge>
        </div>
      )}
    </div>
  );
}