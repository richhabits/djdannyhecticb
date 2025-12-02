import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  Radio,
  Share2,
  Music2,
  MessageSquare,
  ThumbsUp,
  Heart,
  Sparkles,
  Zap,
  Twitter,
  Facebook,
  MessageCircle,
  Send,
  Link2,
  Users,
  TrendingUp,
  Crown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Activity type icons
const ACTIVITY_ICONS = {
  tuned_in: Radio,
  shared: Share2,
  requested_track: Music2,
  shout: MessageSquare,
  upvoted: ThumbsUp,
  reacted: Heart,
  first_time: Sparkles,
};

// Platform icons
const PLATFORM_ICONS = {
  twitter: Twitter,
  facebook: Facebook,
  whatsapp: MessageCircle,
  telegram: Send,
  copy_link: Link2,
  native: Share2,
};

// Activity colors
const ACTIVITY_COLORS = {
  tuned_in: "bg-green-500/10 text-green-500 border-green-500/20",
  shared: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  requested_track: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  shout: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  upvoted: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  reacted: "bg-red-500/10 text-red-500 border-red-500/20",
  first_time: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

interface ActivityItem {
  id: number;
  displayName: string;
  avatarUrl?: string | null;
  activityType: keyof typeof ACTIVITY_ICONS;
  message?: string | null;
  platform?: string | null;
  isHighlighted?: boolean;
  createdAt: Date | string;
}

interface SocialActivityFeedProps {
  className?: string;
  maxItems?: number;
  compact?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function SocialActivityFeed({
  className = "",
  maxItems = 15,
  compact = false,
  autoRefresh = true,
  refreshInterval = 15000,
}: SocialActivityFeedProps) {
  const [newItems, setNewItems] = useState<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Get live activity
  const { data: activities, refetch } = trpc.liveActivity.getRecent.useQuery(
    { limit: maxItems },
    {
      refetchInterval: autoRefresh ? refreshInterval : false,
      refetchOnWindowFocus: true,
    }
  );
  
  // Get highlighted activities
  const { data: highlighted } = trpc.liveActivity.getHighlighted.useQuery(
    { limit: 3 },
    { refetchInterval: autoRefresh ? refreshInterval * 2 : false }
  );
  
  // Get share stats
  const { data: shareStats } = trpc.socialSharing.getStats.useQuery(undefined, {
    refetchInterval: autoRefresh ? 60000 : false,
  });
  
  // Get top sharers
  const { data: topSharers } = trpc.socialSharing.getTopSharers.useQuery(
    { limit: 3 },
    { refetchInterval: autoRefresh ? 120000 : false }
  );
  
  // Track new items for animation
  useEffect(() => {
    if (activities && activities.length > 0) {
      const latestId = activities[0]?.id;
      if (latestId && !newItems.includes(latestId)) {
        setNewItems(prev => [...prev.slice(-10), latestId]);
        // Clear from new items after animation
        setTimeout(() => {
          setNewItems(prev => prev.filter(id => id !== latestId));
        }, 3000);
      }
    }
  }, [activities]);
  
  const getActivityMessage = (item: ActivityItem) => {
    switch (item.activityType) {
      case "tuned_in":
        return "tuned in";
      case "shared":
        return item.message || `shared on ${item.platform || "social"}`;
      case "requested_track":
        return "requested a track";
      case "shout":
        return "sent a shout";
      case "upvoted":
        return "upvoted a track";
      case "reacted":
        return "reacted";
      case "first_time":
        return "joined for the first time! 🎉";
      default:
        return item.message || "is vibing";
    }
  };
  
  const PlatformIcon = (platform?: string | null) => {
    if (!platform) return null;
    const Icon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS];
    if (!Icon) return null;
    return <Icon className="w-3 h-3" />;
  };
  
  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Activity className="w-4 h-4 text-accent" />
        <span className="text-muted-foreground">
          {activities?.length || 0} active now
        </span>
        {shareStats && shareStats.todayShares > 0 && (
          <Badge variant="secondary" className="text-xs">
            {shareStats.todayShares} shares today
          </Badge>
        )}
      </div>
    );
  }
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-5 h-5 text-accent" />
            Live Activity
          </CardTitle>
          <Badge variant="secondary" className="animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            LIVE
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 p-4 pt-0">
        {/* Stats bar */}
        {shareStats && (
          <div className="flex items-center justify-between text-xs text-muted-foreground py-2 border-b">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{shareStats.totalShares} total shares</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{shareStats.todayShares} today</span>
            </div>
          </div>
        )}
        
        {/* Top sharers podium */}
        {topSharers && topSharers.length > 0 && (
          <div className="flex items-center justify-center gap-4 py-2 border-b">
            {topSharers.slice(0, 3).map((sharer, idx) => (
              <div key={sharer.id} className="flex items-center gap-1 text-sm">
                {idx === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                <span className={idx === 0 ? "font-bold" : "text-muted-foreground"}>
                  #{idx + 1}
                </span>
                <span className="text-xs truncate max-w-[60px]">
                  {sharer.totalShares} shares
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Highlighted activities */}
        {highlighted && highlighted.length > 0 && (
          <div className="space-y-2">
            {highlighted.map((item) => {
              const ActivityIcon = ACTIVITY_ICONS[item.activityType as keyof typeof ACTIVITY_ICONS] || Activity;
              
              return (
                <div
                  key={`highlighted-${item.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-accent/10 to-transparent border border-accent/20"
                >
                  <Avatar className="w-8 h-8 ring-2 ring-accent/50">
                    <AvatarImage src={item.avatarUrl || undefined} />
                    <AvatarFallback className="bg-accent/20 text-accent text-xs">
                      {item.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-accent" />
                      {item.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getActivityMessage(item as ActivityItem)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Activity feed */}
        <ScrollArea className="h-[300px]" ref={scrollRef}>
          <div className="space-y-2 pr-4">
            {activities && activities.length > 0 ? (
              activities.map((item) => {
                const isNew = newItems.includes(item.id);
                const ActivityIcon = ACTIVITY_ICONS[item.activityType as keyof typeof ACTIVITY_ICONS] || Activity;
                const colorClass = ACTIVITY_COLORS[item.activityType as keyof typeof ACTIVITY_COLORS] || "bg-gray-500/10 text-gray-500";
                
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-2 rounded-lg transition-all duration-500 ${
                      isNew ? "bg-accent/10 animate-pulse" : "hover:bg-muted/50"
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={item.avatarUrl || undefined} />
                      <AvatarFallback className="bg-muted text-xs">
                        {item.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate max-w-[120px]">
                          {item.displayName}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${colorClass} flex items-center gap-1`}
                        >
                          <ActivityIcon className="w-3 h-3" />
                          {item.activityType.replace(/_/g, " ")}
                        </Badge>
                        {item.platform && (
                          <span className="text-muted-foreground">
                            {PlatformIcon(item.platform)}
                          </span>
                        )}
                      </div>
                      
                      {item.message && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.message}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground/50 mt-1">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Be the first to share!</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Platform breakdown */}
        {shareStats && Object.keys(shareStats.platforms).length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t">
            {Object.entries(shareStats.platforms).map(([platform, count]) => {
              const Icon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS];
              return (
                <Badge key={platform} variant="outline" className="text-xs capitalize">
                  {Icon && <Icon className="w-3 h-3 mr-1" />}
                  {platform.replace(/_/g, " ")}: {count as number}
                </Badge>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
