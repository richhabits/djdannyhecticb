import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Instagram, 
  MessageCircle, 
  Music, 
  Send,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  getTwitterShareUrl,
  getFacebookShareUrl,
  getWhatsAppShareUrl,
  getTelegramShareUrl,
  ShareOptions,
} from "@/lib/shareUtils";

interface TrackShareButtonProps {
  trackId: number;
  title: string;
  artist: string;
  className?: string;
  variant?: "default" | "compact" | "expanded";
}

export function TrackShareButton({
  trackId,
  title,
  artist,
  className = "",
  variant = "default",
}: TrackShareButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const createShareMutation = trpc.trackShares.create.useMutation({
    onSuccess: (share) => {
      toast.success(`Shared on ${share.platform}! 🎉 Earned ${share.coinsEarned} coins!`);
      utils.trackShares.stats.invalidate();
      if (isAuthenticated) {
        utils.trackShares.myStats.invalidate();
        utils.economy.wallet.getMyWallet.invalidate();
      }
      setIsSharing(null);
    },
    onError: (error) => {
      toast.error(`Failed to share: ${error.message}`);
      setIsSharing(null);
    },
  });

  const { data: stats } = trpc.trackShares.stats.useQuery({ trackId });
  const { data: myStats } = trpc.trackShares.myStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Detect user's login method/platform
  const userPlatform = user?.loginMethod?.toLowerCase() || user?.platform?.toLowerCase() || null;
  
  // Determine which platforms to prioritize based on login method
  const getPriorityPlatforms = () => {
    if (!userPlatform) return ["twitter", "facebook", "whatsapp", "instagram"];
    
    const platformMap: Record<string, string[]> = {
      twitter: ["twitter", "facebook", "whatsapp", "instagram"],
      facebook: ["facebook", "twitter", "whatsapp", "instagram"],
      instagram: ["instagram", "twitter", "facebook", "whatsapp"],
      google: ["twitter", "facebook", "whatsapp", "instagram"], // Google login might use various platforms
    };
    
    return platformMap[userPlatform] || ["twitter", "facebook", "whatsapp", "instagram"];
  };

  const priorityPlatforms = getPriorityPlatforms();

  const shareText = `🎵 Now playing on Hectic Radio: "${title}" by ${artist}\n\n🔊 Lock in with DJ Danny Hectic B!\n\n#HecticRadio #DJDannyHecticB #NowPlaying`;
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  const shareOptions: ShareOptions = {
    url: shareUrl,
    title: `🎵 ${title} by ${artist} - Now Playing on Hectic Radio`,
    description: shareText,
  };

  const handleShare = async (platform: string, shareUrl: string) => {
    setIsSharing(platform);
    
    try {
      await createShareMutation.mutateAsync({
        trackId,
        userId: user?.id,
        userName: user?.name || undefined,
        platform: platform as any,
        shareUrl,
        shareText,
        isVerified: false,
      });

      // Open share URL in new window
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const platformButtons = [
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: Twitter,
      color: "hover:bg-blue-500/20 hover:text-blue-500",
      getUrl: () => getTwitterShareUrl({ ...shareOptions, source: "twitter" }),
      priority: priorityPlatforms.indexOf("twitter"),
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "hover:bg-blue-600/20 hover:text-blue-600",
      getUrl: () => getFacebookShareUrl({ ...shareOptions, source: "facebook" }),
      priority: priorityPlatforms.indexOf("facebook"),
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "hover:bg-pink-500/20 hover:text-pink-500",
      getUrl: () => `https://www.instagram.com/`, // Instagram doesn't support direct URL sharing
      priority: priorityPlatforms.indexOf("instagram"),
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: MessageCircle,
      color: "hover:bg-green-500/20 hover:text-green-500",
      getUrl: () => getWhatsAppShareUrl({ ...shareOptions, source: "whatsapp" }),
      priority: priorityPlatforms.indexOf("whatsapp"),
    },
    {
      id: "telegram",
      name: "Telegram",
      icon: Send,
      color: "hover:bg-blue-400/20 hover:text-blue-400",
      getUrl: () => getTelegramShareUrl({ ...shareOptions, source: "telegram" }),
      priority: priorityPlatforms.indexOf("telegram"),
    },
  ].sort((a, b) => {
    // Sort by priority (lower number = higher priority)
    if (a.priority === -1 && b.priority === -1) return 0;
    if (a.priority === -1) return 1;
    if (b.priority === -1) return -1;
    return a.priority - b.priority;
  });

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="hover-lift"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
        {isOpen && (
          <div className="absolute z-50 mt-2 p-2 glass rounded-lg border border-border shadow-lg">
            <div className="flex flex-wrap gap-2">
              {platformButtons.slice(0, 3).map((platform) => {
                const Icon = platform.icon;
                const url = platform.getUrl();
                return (
                  <Button
                    key={platform.id}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleShare(platform.id, url)}
                    disabled={isSharing === platform.id}
                    className={`${platform.color} min-w-[100px]`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {platform.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === "expanded") {
    return (
      <Card className={`glass ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-bold">Share This Track</h3>
              </div>
              {stats && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {stats.totalShares} shares
                  </div>
                  {myStats && (
                    <div className="flex items-center gap-1 text-accent">
                      <Sparkles className="w-4 h-4" />
                      {myStats.totalCoinsEarned} coins earned
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {platformButtons.map((platform) => {
                const Icon = platform.icon;
                const url = platform.getUrl();
                const isPrimary = priorityPlatforms[0] === platform.id;
                
                return (
                  <Button
                    key={platform.id}
                    variant={isPrimary ? "default" : "outline"}
                    onClick={() => handleShare(platform.id, url)}
                    disabled={isSharing === platform.id}
                    className={`${platform.color} ${isPrimary ? "gradient-bg" : ""} flex items-center gap-2`}
                  >
                    <Icon className="w-4 h-4" />
                    {platform.name}
                    {isPrimary && userPlatform && (
                      <span className="text-xs opacity-75">(Your platform)</span>
                    )}
                  </Button>
                );
              })}
            </div>

            {isAuthenticated && myStats && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your sharing stats:</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {myStats.totalShares} total shares
                    </div>
                    <div className="flex items-center gap-1 text-accent font-semibold">
                      <Sparkles className="w-4 h-4" />
                      {myStats.totalCoinsEarned} coins
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <div className="pt-4 border-t border-border text-sm text-muted-foreground text-center">
                <p>💡 Sign in to earn coins for sharing tracks!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="hover-lift"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Track
        {stats && stats.totalShares > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-accent/20 rounded-full text-xs">
            {stats.totalShares}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute z-50 mt-2 right-0 min-w-[280px] glass border border-border shadow-xl">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Music className="w-4 h-4 text-accent" />
                  Share "{title}"
                </h4>
                {userPlatform && (
                  <span className="text-xs text-muted-foreground">
                    Logged in via {userPlatform}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {platformButtons.map((platform) => {
                  const Icon = platform.icon;
                  const url = platform.getUrl();
                  const isPrimary = priorityPlatforms[0] === platform.id;
                  
                  return (
                    <Button
                      key={platform.id}
                      variant={isPrimary ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleShare(platform.id, url)}
                      disabled={isSharing === platform.id}
                      className={`w-full justify-start ${platform.color} ${isPrimary ? "gradient-bg" : ""}`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {platform.name}
                      {isPrimary && (
                        <Sparkles className="w-3 h-3 ml-auto" />
                      )}
                    </Button>
                  );
                })}
              </div>

              {isAuthenticated && myStats && (
                <div className="pt-3 mt-3 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Your shares:</span>
                    <span className="text-accent font-semibold">
                      {myStats.totalShares} ({myStats.totalCoinsEarned} coins)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
