import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Music2,
  MessageCircle,
  Camera,
  Loader2,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "twitter"
  | "facebook"
  | "spotify"
  | "youtube"
  | "snapchat"
  | "telegram";

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  { name: string; icon: any; color: string; description: string }
> = {
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "from-pink-500 to-purple-500",
    description: "Share stories and posts",
  },
  tiktok: {
    name: "TikTok",
    icon: Music2,
    color: "from-black to-cyan-500",
    description: "Share short videos",
  },
  twitter: {
    name: "Twitter/X",
    icon: Twitter,
    color: "from-blue-400 to-blue-600",
    description: "Post tweets",
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "from-blue-600 to-blue-800",
    description: "Share on your timeline",
  },
  spotify: {
    name: "Spotify",
    icon: Music2,
    color: "from-green-400 to-green-600",
    description: "View listening status",
  },
  youtube: {
    name: "YouTube",
    icon: Youtube,
    color: "from-red-500 to-red-700",
    description: "Post community updates",
  },
  snapchat: {
    name: "Snapchat",
    icon: Camera,
    color: "from-yellow-400 to-yellow-600",
    description: "Share snaps",
  },
  telegram: {
    name: "Telegram",
    icon: MessageCircle,
    color: "from-blue-400 to-blue-500",
    description: "Post to channels",
  },
};

export function SocialConnections() {
  const { data: connections, refetch } = trpc.socialMedia.connections.myConnections.useQuery();
  const disconnectMutation = trpc.socialMedia.connections.disconnect.useMutation();
  const toggleAutoShareMutation = trpc.socialMedia.connections.toggleAutoShare.useMutation();
  const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);

  const utils = trpc.useUtils();

  const handleConnect = async (platform: SocialPlatform) => {
    setConnectingPlatform(platform);
    try {
      // Get auth URL from backend
      const { data } = await utils.socialMedia.connections.getAuthUrl.fetch({ platform });
      
      if (!data?.url) {
        toast.error(`${PLATFORM_CONFIG[platform].name} integration not configured`);
        return;
      }

      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const popup = window.open(
        data.url,
        `Connect ${PLATFORM_CONFIG[platform].name}`,
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for popup close
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup);
          setConnectingPlatform(null);
          refetch();
        }
      }, 500);
    } catch (error) {
      toast.error("Failed to connect account");
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (connectionId: number, platformName: string) => {
    try {
      await disconnectMutation.mutateAsync({ connectionId });
      toast.success(`Disconnected from ${platformName}`);
      refetch();
    } catch (error) {
      toast.error("Failed to disconnect account");
    }
  };

  const handleToggleAutoShare = async (platform: SocialPlatform, enabled: boolean) => {
    try {
      await toggleAutoShareMutation.mutateAsync({ platform, enabled });
      toast.success(`Auto-share ${enabled ? "enabled" : "disabled"} for ${PLATFORM_CONFIG[platform].name}`);
      refetch();
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const connectedPlatforms = new Set(connections?.map((c) => c.platform) || []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Connected Social Accounts
        </CardTitle>
        <CardDescription>
          Connect your social media accounts to share tracks automatically
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.keys(PLATFORM_CONFIG) as SocialPlatform[]).map((platform) => {
            const config = PLATFORM_CONFIG[platform];
            const connection = connections?.find((c) => c.platform === platform);
            const isConnected = !!connection;
            const Icon = config.icon;

            return (
              <Card key={platform} className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${config.color}`} />
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-r ${config.color} text-white`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{config.name}</h3>
                          {isConnected && (
                            <Badge variant="success" className="flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                        {connection?.platformUsername && (
                          <p className="text-xs text-accent mt-1">
                            @{connection.platformUsername}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {isConnected ? (
                      <>
                        <div className="flex items-center justify-between">
                          <label className="text-sm">Auto-share tracks</label>
                          <Switch
                            checked={connection?.autoShareEnabled || false}
                            onCheckedChange={(checked) =>
                              handleToggleAutoShare(platform, checked)
                            }
                            disabled={toggleAutoShareMutation.isPending}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleDisconnect(connection!.id, config.name)}
                          disabled={disconnectMutation.isPending}
                        >
                          {disconnectMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleConnect(platform)}
                        disabled={connectingPlatform === platform}
                      >
                        {connectingPlatform === platform ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <ExternalLink className="w-4 h-4 mr-2" />
                        )}
                        Connect {config.name}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {connections && connections.length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Enable auto-share to automatically post what you're
              listening to on Hectic Radio. Earn HecticCoins for every share!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
