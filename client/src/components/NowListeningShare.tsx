import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Radio,
  Share2,
  Music2,
  Disc3,
  Sparkles,
  Headphones,
  Waves,
  Twitter,
  MessageCircle,
  Facebook,
  Send,
  Flame,
  Coins,
  Users,
  ExternalLink,
} from "lucide-react";
import {
  getWhatsAppShareUrl,
  getTwitterShareUrl,
  getFacebookShareUrl,
  getTelegramShareUrl,
  buildShareUrl,
} from "@/lib/shareUtils";

interface NowListeningShareProps {
  className?: string;
  showQuickShare?: boolean;
}

export function NowListeningShare({ 
  className = "",
  showQuickShare = true,
}: NowListeningShareProps) {
  const { user, isAuthenticated } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [lastSharedPlatform, setLastSharedPlatform] = useState<string | null>(null);
  
  // Get current track
  const { data: nowPlaying, isLoading } = trpc.tracks.nowPlaying.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30s
  });
  
  // Get user's share streak
  const { data: streak } = trpc.socialSharing.getMyStreak.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  // Get recent shares for social proof
  const { data: recentShares } = trpc.socialSharing.getRecentShares.useQuery(
    { limit: 5 },
    { refetchInterval: 60000 }
  );
  
  const trackShareMutation = trpc.socialSharing.trackShare.useMutation({
    onSuccess: (data) => {
      setIsSharing(false);
      if (data.coinsEarned > 0) {
        toast.success(
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span>+{data.coinsEarned} HecticCoins!</span>
            {data.streak && data.streak.currentStreak > 1 && (
              <Badge variant="secondary" className="ml-1">
                🔥 {data.streak.currentStreak} day streak
              </Badge>
            )}
          </div>,
          { duration: 4000 }
        );
      }
    },
    onError: () => {
      setIsSharing(false);
      toast.error("Failed to track share. Try again!");
    },
  });
  
  // Build share text for now playing
  const buildShareText = () => {
    if (!nowPlaying) return "Check out Hectic Radio! 🔥";
    
    return `🎧 Locked in to @HecticRadio\n\n🎵 Now playing: ${nowPlaying.title} by ${nowPlaying.artist}\n\nTune in and vibe with us! 🔥`;
  };
  
  const shareUrl = "/live";
  const shareText = buildShareText();
  
  // Quick share handlers for each platform
  const quickShare = async (platform: "twitter" | "facebook" | "whatsapp" | "telegram") => {
    setIsSharing(true);
    setLastSharedPlatform(platform);
    
    const fullUrl = typeof window !== "undefined" 
      ? window.location.origin + shareUrl 
      : shareUrl;
    
    let shareLink: string;
    
    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(buildShareUrl(fullUrl, "twitter"))}`;
        break;
      case "facebook":
        shareLink = getFacebookShareUrl({ url: fullUrl, title: shareText, source: "facebook" });
        break;
      case "whatsapp":
        shareLink = getWhatsAppShareUrl({ url: fullUrl, title: shareText, source: "whatsapp" });
        break;
      case "telegram":
        shareLink = getTelegramShareUrl({ url: fullUrl, title: shareText, source: "telegram" });
        break;
    }
    
    // Open share window
    window.open(shareLink, "_blank", "width=600,height=400");
    
    // Track the share
    trackShareMutation.mutate({
      platform,
      contentType: "now_playing",
      contentId: nowPlaying?.id,
      contentTitle: nowPlaying?.title,
      contentArtist: nowPlaying?.artist,
      shareMessage: shareText,
      guestName: !isAuthenticated ? "Guest Listener" : undefined,
    });
  };
  
  // Determine preferred platform based on login method
  const preferredPlatform = (user?.loginMethod?.toLowerCase() as "twitter" | "facebook" | "whatsapp" | "telegram") || "twitter";
  
  // One-click share button
  const handleOneClickShare = () => {
    quickShare(preferredPlatform);
  };
  
  if (isLoading) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`overflow-hidden bg-gradient-to-br from-orange-950/20 via-background to-amber-950/20 border-accent/20 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="relative">
              <Radio className="w-5 h-5 text-accent" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            Listening Now
          </CardTitle>
          {recentShares && recentShares.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {recentShares.length} shared recently
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {nowPlaying ? (
          <>
            {/* Now Playing Info */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg group">
                <Disc3 className="w-8 h-8 text-white animate-spin-slow" />
                <div className="absolute inset-0 rounded-lg bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                {/* Sound waves animation */}
                <div className="absolute -right-1 -bottom-1">
                  <Waves className="w-4 h-4 text-accent animate-pulse" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg truncate">{nowPlaying.title}</p>
                <p className="text-muted-foreground truncate">{nowPlaying.artist}</p>
                {nowPlaying.note && (
                  <p className="text-xs text-accent mt-1 truncate">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {nowPlaying.note}
                  </p>
                )}
              </div>
            </div>
            
            {/* Quick Share Section */}
            {showQuickShare && (
              <div className="space-y-3">
                {/* One-click share button */}
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold relative overflow-hidden group"
                  size="lg"
                  onClick={handleOneClickShare}
                  disabled={isSharing}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Share2 className="w-5 h-5 mr-2" />
                  Share What I'm Listening To
                  {isAuthenticated && streak && streak.currentStreak > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                      <Flame className="w-3 h-3 mr-1" />
                      +{10 + (streak.streakBonusLevel === "platinum" ? 20 : streak.streakBonusLevel === "gold" ? 10 : streak.streakBonusLevel === "silver" ? 5 : streak.streakBonusLevel === "bronze" ? 2 : 0)} coins
                    </Badge>
                  )}
                </Button>
                
                {/* Quick platform buttons */}
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-xs text-muted-foreground">Quick share:</span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant={preferredPlatform === "twitter" ? "default" : "ghost"}
                      className={`w-8 h-8 ${preferredPlatform === "twitter" ? "bg-black" : ""} ${lastSharedPlatform === "twitter" ? "ring-2 ring-green-500" : ""}`}
                      onClick={() => quickShare("twitter")}
                    >
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant={preferredPlatform === "facebook" ? "default" : "ghost"}
                      className={`w-8 h-8 ${preferredPlatform === "facebook" ? "bg-blue-600" : ""} ${lastSharedPlatform === "facebook" ? "ring-2 ring-green-500" : ""}`}
                      onClick={() => quickShare("facebook")}
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant={preferredPlatform === "whatsapp" ? "default" : "ghost"}
                      className={`w-8 h-8 ${preferredPlatform === "whatsapp" ? "bg-green-600" : ""} ${lastSharedPlatform === "whatsapp" ? "ring-2 ring-green-500" : ""}`}
                      onClick={() => quickShare("whatsapp")}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant={preferredPlatform === "telegram" ? "default" : "ghost"}
                      className={`w-8 h-8 ${preferredPlatform === "telegram" ? "bg-sky-500" : ""} ${lastSharedPlatform === "telegram" ? "ring-2 ring-green-500" : ""}`}
                      onClick={() => quickShare("telegram")}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Streak indicator for logged in users */}
            {isAuthenticated && streak && streak.currentStreak > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-muted-foreground">
                  {streak.currentStreak} day sharing streak
                </span>
                <Badge variant="outline" className="text-xs capitalize">
                  {streak.streakBonusLevel !== "none" ? streak.streakBonusLevel : "Keep it up!"}
                </Badge>
              </div>
            )}
            
            {/* Login prompt */}
            {!isAuthenticated && (
              <div className="text-center text-sm">
                <a href="/login" className="text-accent hover:underline inline-flex items-center gap-1">
                  Log in to earn HecticCoins
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Music2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Waiting for the next track...</p>
            <p className="text-sm">Stay tuned to Hectic Radio!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
