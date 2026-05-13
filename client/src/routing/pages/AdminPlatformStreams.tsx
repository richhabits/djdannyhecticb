import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { z } from "zod";
import { Youtube, Radio, Copy, RefreshCw, AlertCircle } from "lucide-react";

const platformNameMap = {
  youtube: "YouTube",
  twitch: "Twitch",
  tiktok: "TikTok",
  instagram: "Instagram",
  own_stream: "Own Stream",
};

const platformColorMap = {
  youtube: "bg-red-600",
  twitch: "bg-purple-600",
  tiktok: "bg-black",
  instagram: "bg-pink-600",
  own_stream: "bg-blue-600",
};

export default function AdminPlatformStreams() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<"youtube" | "twitch">("youtube");
  const [channelId, setChannelId] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokLive, setTiktokLive] = useState(false);
  const [instagramLive, setInstagramLive] = useState(false);

  const { data: statuses = [], refetch: refetchStatuses } = trpc.platformStream.getLiveStatuses.useQuery();
  const { data: obsConfig } = trpc.platformStream.getOBSConfig.useQuery({ platform: selectedPlatform });
  const updateChannelConfig = trpc.platformStream.updateChannelConfig.useMutation();
  const setManualLive = trpc.platformStream.setManualLive.useMutation();
  const refreshStatus = trpc.platformStream.refreshStatus.useMutation();
  const initializePlatforms = trpc.platformStream.initializePlatforms.useMutation();

  const handleCopyKey = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdateChannelId = async () => {
    try {
      await updateChannelConfig.mutateAsync({
        platform: selectedPlatform,
        channelId,
      });
      alert(`${platformNameMap[selectedPlatform]} channel ID updated!`);
      setChannelId("");
    } catch (error) {
      alert("Error updating channel ID: " + (error as any).message);
    }
  };

  const handleSetManualLive = async (platform: "tiktok" | "instagram", isLive: boolean, url?: string) => {
    try {
      await setManualLive.mutateAsync({
        platform,
        isLive,
        streamUrl: url,
        streamTitle: isLive ? `${platformNameMap[platform]} Stream` : undefined,
      });
      refetchStatuses();
    } catch (error) {
      alert("Error updating manual live status: " + (error as any).message);
    }
  };

  const handleRefreshStatus = async (platform?: "youtube" | "twitch") => {
    try {
      await refreshStatus.mutateAsync({ platform });
      refetchStatuses();
    } catch (error) {
      alert("Error refreshing status: " + (error as any).message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Platform Streams</h1>
          <p className="text-gray-400 mt-2">
            Manage live streaming across YouTube, Twitch, TikTok, Instagram, and self-hosted RTMP.
          </p>
        </div>

        {/* Platform Status Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Platform Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {(Object.keys(platformNameMap) as Array<keyof typeof platformNameMap>).map((platform) => {
              const status = statuses.find((s) => s.platform === platform);
              const isLive = status?.isLive || false;
              const viewerCount = status?.viewerCount || 0;

              return (
                <Card key={platform} className="p-4">
                  <div className={`${platformColorMap[platform]} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                    {platform === "youtube" && <Youtube className="text-white w-6 h-6" />}
                    {platform === "twitch" && <Radio className="text-white w-6 h-6" />}
                    {(platform === "tiktok" || platform === "instagram" || platform === "own_stream") && (
                      <div className="text-white text-sm font-bold">{platform[0].toUpperCase()}</div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{platformNameMap[platform]}</h3>
                  <div className="space-y-2">
                    <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${isLive ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}>
                      {isLive ? "🔴 LIVE" : "⚫ Offline"}
                    </div>
                    {isLive && viewerCount > 0 && (
                      <div className="text-xs text-gray-400">{viewerCount} viewers</div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Manual Override for TikTok & Instagram */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Manual Live Toggle (TikTok & Instagram)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TikTok */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-black rounded flex items-center justify-center text-white text-xs font-bold">T</span>
                TikTok Live
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="TikTok Stream URL"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleSetManualLive("tiktok", true, tiktokUrl);
                      setTiktokLive(true);
                    }}
                    className="flex-1 bg-black hover:bg-gray-900"
                  >
                    Mark Live
                  </Button>
                  <Button
                    onClick={() => {
                      handleSetManualLive("tiktok", false);
                      setTiktokLive(false);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Mark Offline
                  </Button>
                </div>
              </div>
            </Card>

            {/* Instagram */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">I</span>
                Instagram Live
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Instagram Stream URL"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleSetManualLive("instagram", true, instagramUrl);
                      setInstagramLive(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  >
                    Mark Live
                  </Button>
                  <Button
                    onClick={() => {
                      handleSetManualLive("instagram", false);
                      setInstagramLive(false);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Mark Offline
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Channel Configuration */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Channel Configuration</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedPlatform("youtube")}
                  variant={selectedPlatform === "youtube" ? "default" : "outline"}
                  className="gap-2"
                >
                  <Youtube className="w-4 h-4" />
                  YouTube
                </Button>
                <Button
                  onClick={() => setSelectedPlatform("twitch")}
                  variant={selectedPlatform === "twitch" ? "default" : "outline"}
                  className="gap-2"
                >
                  <Radio className="w-4 h-4" />
                  Twitch
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {selectedPlatform === "youtube" ? "YouTube Channel ID" : "Twitch Channel Name"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={selectedPlatform === "youtube" ? "UCxxxxxxxxxxxxxxx" : "your_twitch_username"}
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                  />
                  <Button onClick={handleUpdateChannelId} disabled={!channelId || updateChannelConfig.isPending}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* OBS Configuration */}
        {obsConfig && (
          <section>
            <h2 className="text-2xl font-bold mb-4">OBS Streaming Keys</h2>
            <Card className="p-6 bg-gray-900 border border-yellow-900">
              <div className="flex gap-2 items-start mb-4">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-100">
                  Keep these keys private! Anyone with these keys can stream on your account.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">RTMP URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={obsConfig.rtmpUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                    <Button
                      onClick={() => handleCopyKey(obsConfig.rtmpUrl, "rtmp")}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {copiedKey === "rtmp" && <p className="text-xs text-green-400 mt-1">✓ Copied</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stream Key (from .env)</label>
                  <p className="text-xs text-gray-400 mb-2">Environment Variable: {obsConfig.streamKeyEnvVar}</p>
                  <div className="bg-gray-800 border border-gray-700 rounded p-2">
                    <p className="text-xs text-gray-400">Set in your environment: {obsConfig.streamKeyEnvVar}=your_key_here</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">OBS Settings</h4>
                  <div className="bg-gray-800 border border-gray-700 rounded p-3 text-xs text-gray-300 space-y-1">
                    <p><strong>Service:</strong> {selectedPlatform === "youtube" ? "YouTube / YouTube Gaming" : "Twitch"}</p>
                    <p><strong>Server:</strong> {obsConfig.rtmpUrl}</p>
                    <p><strong>Stream Key:</strong> Paste your stream key from {obsConfig.streamKeyEnvVar}</p>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Refresh Controls */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Status Refresh</h2>
          <div className="flex gap-3">
            <Button
              onClick={() => handleRefreshStatus("youtube")}
              disabled={refreshStatus.isPending}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh YouTube
            </Button>
            <Button
              onClick={() => handleRefreshStatus("twitch")}
              disabled={refreshStatus.isPending}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Twitch
            </Button>
            <Button
              onClick={() => handleRefreshStatus()}
              disabled={refreshStatus.isPending}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh All
            </Button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
