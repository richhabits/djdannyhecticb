import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Twitter,
  Facebook,
  MessageCircle,
  Send,
  Copy,
  Check,
  Share2,
  Flame,
  Coins,
  Zap,
  Music2,
  Sparkles,
} from "lucide-react";
import {
  getWhatsAppShareUrl,
  getTwitterShareUrl,
  getFacebookShareUrl,
  getTelegramShareUrl,
  copyToClipboard,
} from "@/lib/shareUtils";

// Platform icons & colors
const PLATFORM_CONFIG = {
  twitter: {
    icon: Twitter,
    label: "X",
    color: "bg-black hover:bg-black/90",
    shareUrl: getTwitterShareUrl,
  },
  facebook: {
    icon: Facebook,
    label: "Facebook",
    color: "bg-blue-600 hover:bg-blue-700",
    shareUrl: getFacebookShareUrl,
  },
  whatsapp: {
    icon: MessageCircle,
    label: "WhatsApp",
    color: "bg-green-600 hover:bg-green-700",
    shareUrl: getWhatsAppShareUrl,
  },
  telegram: {
    icon: Send,
    label: "Telegram",
    color: "bg-sky-500 hover:bg-sky-600",
    shareUrl: getTelegramShareUrl,
  },
};

type Platform = keyof typeof PLATFORM_CONFIG;

interface InteractiveSocialShareProps {
  contentType: "now_playing" | "track_request" | "shout" | "mix" | "episode" | "event" | "profile" | "station";
  contentId?: number;
  contentTitle?: string;
  contentArtist?: string;
  shareUrl: string;
  shareTitle: string;
  shareDescription?: string;
  variant?: "full" | "compact" | "floating";
  showRewards?: boolean;
  onShare?: (platform: string) => void;
}

export function InteractiveSocialShare({
  contentType,
  contentId,
  contentTitle,
  contentArtist,
  shareUrl,
  shareTitle,
  shareDescription,
  variant = "full",
  showRewards = true,
  onShare,
}: InteractiveSocialShareProps) {
  const { user, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [recentShare, setRecentShare] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const trackShareMutation = trpc.socialSharing.trackShare.useMutation({
    onSuccess: (data) => {
      if (data.coinsEarned > 0) {
        toast.success(
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span>+{data.coinsEarned} HecticCoins earned!</span>
            {data.streak && data.streak.currentStreak > 1 && (
              <Badge variant="secondary" className="ml-1">
                <Flame className="w-3 h-3 mr-1" />
                {data.streak.currentStreak} day streak!
              </Badge>
            )}
          </div>
        );
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      } else {
        toast.success("Shared! Thanks for spreading the vibes 🔥");
      }
    },
  });
  
  const { data: streak } = trpc.socialSharing.getMyStreak.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  // Determine user's preferred platform based on login method
  const userLoginPlatform = user?.loginMethod?.toLowerCase() as Platform | undefined;
  
  // Reorder platforms to show user's login platform first
  const orderedPlatforms = Object.keys(PLATFORM_CONFIG) as Platform[];
  if (userLoginPlatform && PLATFORM_CONFIG[userLoginPlatform]) {
    const idx = orderedPlatforms.indexOf(userLoginPlatform);
    if (idx > 0) {
      orderedPlatforms.splice(idx, 1);
      orderedPlatforms.unshift(userLoginPlatform);
    }
  }
  
  const handleShare = async (platform: Platform) => {
    const config = PLATFORM_CONFIG[platform];
    const fullUrl = typeof window !== "undefined" ? window.location.origin + shareUrl : shareUrl;
    const shareLink = config.shareUrl({
      url: fullUrl,
      title: shareTitle,
      description: shareDescription,
      source: platform,
    });
    
    // Open share window
    window.open(shareLink, "_blank", "width=600,height=400");
    
    // Track the share
    setRecentShare(platform);
    trackShareMutation.mutate({
      platform,
      contentType,
      contentId,
      contentTitle,
      contentArtist,
      guestName: !isAuthenticated ? "Guest" : undefined,
    });
    
    onShare?.(platform);
  };
  
  const handleCopyLink = async () => {
    const fullUrl = typeof window !== "undefined" ? window.location.origin + shareUrl : shareUrl;
    const success = await copyToClipboard(fullUrl);
    if (success) {
      setCopied(true);
      toast.success("Link copied!");
      
      trackShareMutation.mutate({
        platform: "copy_link",
        contentType,
        contentId,
        contentTitle,
        contentArtist,
        guestName: !isAuthenticated ? "Guest" : undefined,
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleNativeShare = async () => {
    if (!navigator.share) return;
    
    const fullUrl = typeof window !== "undefined" ? window.location.origin + shareUrl : shareUrl;
    try {
      await navigator.share({
        title: shareTitle,
        text: shareDescription,
        url: fullUrl,
      });
      
      trackShareMutation.mutate({
        platform: "native",
        contentType,
        contentId,
        contentTitle,
        contentArtist,
        guestName: !isAuthenticated ? "Guest" : undefined,
      });
    } catch (err) {
      // User cancelled or error
    }
  };
  
  // Compact variant - just buttons
  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {orderedPlatforms.map((platform) => {
          const config = PLATFORM_CONFIG[platform];
          const Icon = config.icon;
          const isPreferred = platform === userLoginPlatform;
          
          return (
            <Button
              key={platform}
              size="sm"
              variant={isPreferred ? "default" : "outline"}
              className={isPreferred ? config.color + " text-white relative" : "hover-lift"}
              onClick={() => handleShare(platform)}
            >
              <Icon className="w-4 h-4 mr-1" />
              {config.label}
              {isPreferred && (
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
              )}
            </Button>
          );
        })}
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyLink}
          className="hover-lift"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </>
          )}
        </Button>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleNativeShare}
            className="hover-lift"
          >
            <Share2 className="w-4 h-4 mr-1" />
            More
          </Button>
        )}
      </div>
    );
  }
  
  // Floating variant - fixed position share button
  if (variant === "floating") {
    return (
      <div className="fixed bottom-24 right-4 z-40">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg animate-pulse-slow"
          onClick={() => {
            if ("share" in navigator) {
              handleNativeShare();
            } else {
              handleShare(userLoginPlatform || "twitter");
            }
          }}
        >
          <Share2 className="w-6 h-6" />
        </Button>
      </div>
    );
  }
  
  // Full variant - card with all options
  return (
    <Card className={`overflow-hidden relative ${showConfetti ? "ring-2 ring-yellow-400 ring-opacity-50" : ""}`}>
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 animate-confetti-1">🎉</div>
          <div className="absolute top-0 left-1/2 animate-confetti-2">✨</div>
          <div className="absolute top-0 left-3/4 animate-confetti-3">🔥</div>
        </div>
      )}
      
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-accent" />
            <span className="font-semibold">Share the Vibes</span>
          </div>
          {showRewards && isAuthenticated && streak && (
            <div className="flex items-center gap-2">
              {streak.currentStreak > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  {streak.currentStreak} day streak
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-yellow-500" />
                Earn coins
              </Badge>
            </div>
          )}
        </div>
        
        {/* Content preview */}
        {contentTitle && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{contentTitle}</p>
              {contentArtist && (
                <p className="text-sm text-muted-foreground truncate">{contentArtist}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Share buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {orderedPlatforms.map((platform) => {
            const config = PLATFORM_CONFIG[platform];
            const Icon = config.icon;
            const isPreferred = platform === userLoginPlatform;
            const isRecent = platform === recentShare;
            
            return (
              <Button
                key={platform}
                variant={isPreferred ? "default" : "outline"}
                className={`relative ${isPreferred ? config.color + " text-white" : ""} ${isRecent ? "ring-2 ring-green-500" : ""}`}
                onClick={() => handleShare(platform)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {config.label}
                {isPreferred && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Zap className="w-3 h-3 text-black" />
                  </span>
                )}
                {isRecent && (
                  <Check className="w-4 h-4 ml-1 text-green-500" />
                )}
              </Button>
            );
          })}
        </div>
        
        {/* Copy and native share */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleNativeShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              More Options
            </Button>
          )}
        </div>
        
        {/* Login prompt for guests */}
        {!isAuthenticated && showRewards && (
          <div className="text-center text-sm text-muted-foreground">
            <a href="/login" className="text-accent hover:underline">
              Log in
            </a>{" "}
            to earn HecticCoins when you share!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
