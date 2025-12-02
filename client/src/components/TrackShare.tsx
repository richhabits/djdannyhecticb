import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Twitter, 
  Facebook, 
  Send, 
  Copy, 
  Check, 
  Share2,
  Instagram,
  Music
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { 
  getTrackShareUrl, 
  generateTrackShareText,
  detectUserPlatform,
  copyToClipboard 
} from "@/lib/shareUtils";
import { useAuth } from "@/_core/hooks/useAuth";

interface TrackShareProps {
  trackId: number;
  trackTitle: string;
  trackArtist: string;
  stationName?: string;
  className?: string;
  variant?: "default" | "compact" | "icon-only";
  onShare?: (platform: string) => void;
}

export function TrackShare({
  trackId,
  trackTitle,
  trackArtist,
  stationName = "Hectic Radio",
  className = "",
  variant = "default",
  onShare,
}: TrackShareProps) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const utils = trpc.useUtils();
  
  const createShare = trpc.trackShares.create.useMutation({
    onSuccess: () => {
      utils.trackShares.stats.invalidate({ trackId });
      toast.success("Track shared! 🔥");
    },
    onError: (error) => {
      console.error("Failed to create share:", error);
      // Don't show error toast - sharing might still work even if tracking fails
    },
  });

  const shareText = generateTrackShareText({
    trackTitle,
    trackArtist,
    stationName,
  });

  // Detect user's platform from login method
  const userPlatform = detectUserPlatform(user?.loginMethod);
  
  // Platforms to show - prioritize user's platform
  const platforms = [
    { id: "twitter", name: "X (Twitter)", icon: Twitter, color: "hover:text-blue-400" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "hover:text-blue-600" },
    { id: "whatsapp", name: "WhatsApp", icon: MessageCircle, color: "hover:text-green-500" },
    { id: "telegram", name: "Telegram", icon: Send, color: "hover:text-blue-500" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "hover:text-pink-500" },
  ];

  // Reorder platforms to put user's platform first
  const sortedPlatforms = userPlatform
    ? [
        ...platforms.filter((p) => p.id === userPlatform),
        ...platforms.filter((p) => p.id !== userPlatform),
      ]
    : platforms;

  const handleShare = async (platform: string) => {
    const shareUrl = getTrackShareUrl(platform, {
      trackTitle,
      trackArtist,
      stationName,
    });

    // Track the share in database
    try {
      await createShare.mutateAsync({
        trackId,
        platform: platform as any,
        shareUrl: shareUrl.startsWith("http") ? shareUrl : undefined,
        shareText,
      });
    } catch (err) {
      // Continue even if tracking fails
    }

    // Handle platform-specific sharing
    if (platform === "instagram" || platform === "tiktok") {
      // Copy text for platforms that don't support URL sharing
      const success = await copyToClipboard(shareText);
      if (success) {
        toast.success(`Copied! Paste into ${platform === "instagram" ? "Instagram" : "TikTok"} 📱`);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        toast.error("Failed to copy text");
      }
    } else if (shareUrl.startsWith("http")) {
      // Open share URL in new window
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    } else {
      // Fallback: copy text
      const success = await copyToClipboard(shareText);
      if (success) {
        toast.success("Copied to clipboard! 📋");
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    }

    onShare?.(platform);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      toast.success("Track info copied! 📋");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Failed to copy");
    }
  };

  if (variant === "icon-only") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {sortedPlatforms.slice(0, 3).map((platform) => {
          const Icon = platform.icon;
          return (
            <Button
              key={platform.id}
              size="icon"
              variant="ghost"
              className={`h-8 w-8 ${platform.color}`}
              onClick={() => handleShare(platform.id)}
              title={`Share on ${platform.name}`}
            >
              <Icon className="w-4 h-4" />
            </Button>
          );
        })}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={handleCopy}
          title="Copy track info"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleShare(sortedPlatforms[0]?.id || "twitter")}
          className="flex items-center gap-1"
        >
          <Share2 className="w-4 h-4" />
          Share Track
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-8 w-8 p-0"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Music className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Share this track:</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {sortedPlatforms.map((platform) => {
          const Icon = platform.icon;
          const isUserPlatform = platform.id === userPlatform;
          
          return (
            <Button
              key={platform.id}
              size="sm"
              variant={isUserPlatform ? "default" : "outline"}
              className={`flex items-center gap-1 ${platform.color} ${
                isUserPlatform ? "ring-2 ring-offset-2" : ""
              }`}
              onClick={() => handleShare(platform.id)}
              title={isUserPlatform ? `Share on ${platform.name} (your platform)` : `Share on ${platform.name}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{platform.name}</span>
              {isUserPlatform && (
                <span className="text-xs opacity-75">(You)</span>
              )}
            </Button>
          );
        })}
        
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="flex items-center gap-1"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </Button>
      </div>
      
      {userPlatform && (
        <p className="text-xs text-muted-foreground">
          💡 We detected you're logged in via {userPlatform} - tap that button for quick sharing!
        </p>
      )}
    </div>
  );
}
