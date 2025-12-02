import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import {
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  Music2,
  Share2,
  Coins,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type SharePlatform =
  | "instagram"
  | "tiktok"
  | "twitter"
  | "facebook"
  | "whatsapp"
  | "telegram";

interface EnhancedSocialShareProps {
  trackTitle: string;
  trackArtist: string;
  trackId?: number;
  shareType?: "nowPlaying" | "trackRequest" | "mix" | "episode" | "manual";
  variant?: "full" | "compact" | "button";
  className?: string;
}

const PLATFORM_ICONS: Record<SharePlatform, any> = {
  instagram: Instagram,
  tiktok: Music2,
  twitter: Twitter,
  facebook: Facebook,
  whatsapp: MessageCircle,
  telegram: MessageCircle,
};

const PLATFORM_COLORS: Record<SharePlatform, string> = {
  instagram: "from-pink-500 to-purple-500",
  tiktok: "from-black to-cyan-500",
  twitter: "from-blue-400 to-blue-600",
  facebook: "from-blue-600 to-blue-800",
  whatsapp: "from-green-400 to-green-600",
  telegram: "from-blue-400 to-blue-500",
};

export function EnhancedSocialShare({
  trackTitle,
  trackArtist,
  trackId,
  shareType = "manual",
  variant = "full",
  className = "",
}: EnhancedSocialShareProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SharePlatform | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: connections } = trpc.socialMedia.connections.myConnections.useQuery();
  const { data: rewardConfigs } = trpc.socialMedia.rewardConfig.list.useQuery();
  const shareMutation = trpc.socialMedia.sharing.shareTrack.useMutation();

  const connectedPlatforms = new Set(connections?.map((c) => c.platform) || []);

  const handleShareClick = (platform: SharePlatform) => {
    setSelectedPlatform(platform);
    setIsDialogOpen(true);
  };

  const handleShare = async () => {
    if (!selectedPlatform) return;

    try {
      const result = await shareMutation.mutateAsync({
        trackId,
        trackTitle,
        trackArtist,
        platform: selectedPlatform,
        shareType,
        customMessage: customMessage || undefined,
      });

      if (result.posted) {
        toast.success(
          <div>
            <p className="font-semibold">Shared successfully!</p>
            {result.coinsEarned > 0 && (
              <p className="text-sm flex items-center gap-1 mt-1">
                <Coins className="w-4 h-4 text-yellow-500" />
                Earned {result.coinsEarned} HecticCoins
              </p>
            )}
          </div>
        );
      } else {
        toast.info("Share recorded! Connect your account to auto-post.");
      }

      setIsDialogOpen(false);
      setCustomMessage("");
      setSelectedPlatform(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to share track");
    }
  };

  const getRewardForPlatform = (platform: SharePlatform) => {
    const config = rewardConfigs?.find(
      (c) => c.platform === platform && c.shareType === shareType && c.isActive
    );
    return config?.coinsPerShare || 0;
  };

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className={className}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Track
      </Button>
    );
  }

  const platforms: SharePlatform[] = [
    "twitter",
    "instagram",
    "tiktok",
    "facebook",
    "whatsapp",
    "telegram",
  ];

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        {variant === "full" && (
          <span className="text-sm font-medium text-muted-foreground mr-2">Share:</span>
        )}

        {platforms.map((platform) => {
          const Icon = PLATFORM_ICONS[platform];
          const isConnected = connectedPlatforms.has(platform);
          const reward = getRewardForPlatform(platform);

          return (
            <Button
              key={platform}
              size="sm"
              variant={isConnected ? "default" : "outline"}
              onClick={() => handleShareClick(platform)}
              className={`relative ${isConnected ? `bg-gradient-to-r ${PLATFORM_COLORS[platform]} hover:opacity-90` : ""}`}
            >
              <Icon className="w-4 h-4 mr-1" />
              {variant === "full" &&
                platform.charAt(0).toUpperCase() + platform.slice(1)}
              {reward > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 px-1 py-0 h-4 text-[10px] flex items-center gap-0.5"
                >
                  <Coins className="w-3 h-3 text-yellow-500" />
                  {reward}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Share on {selectedPlatform && selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
            </DialogTitle>
            <DialogDescription>
              Share "{trackTitle}" by {trackArtist} with your followers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedPlatform && !connectedPlatforms.has(selectedPlatform) && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Account not connected</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Connect your{" "}
                    {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}{" "}
                    account to auto-post. You can still record the share manually.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder={`🔥 Vibing to "${trackTitle}" by ${trackArtist} on Hectic Radio! 🎧`}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
            </div>

            {selectedPlatform && getRewardForPlatform(selectedPlatform) > 0 && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <div className="text-sm">
                  <p className="font-medium">
                    Earn {getRewardForPlatform(selectedPlatform)} HecticCoins
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Share and earn rewards!
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setCustomMessage("");
                  setSelectedPlatform(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                disabled={shareMutation.isPending}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
              >
                {shareMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Share2 className="w-4 h-4 mr-2" />
                )}
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
