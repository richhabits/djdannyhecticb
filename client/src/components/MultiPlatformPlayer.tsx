import React, { useMemo } from "react";
import ReactPlayer from "react-player";
import { trpc } from "../lib/trpc";

type PlatformType = "youtube" | "twitch" | "tiktok" | "instagram" | "own_stream";

export function MultiPlatformPlayer() {
  const { data: statuses = [] } = trpc.platformStream.getLiveStatuses.useQuery(
    undefined,
    { refetchInterval: 30000 }
  );

  // Find which platform is currently live
  const livePlatform = useMemo(() => {
    return statuses.find((s) => s.isLive);
  }, [statuses]);

  // Map platform names to display text
  const platformLabels: Record<PlatformType, string> = {
    youtube: "YouTube Live",
    twitch: "Twitch",
    tiktok: "TikTok Live",
    instagram: "Instagram Live",
    own_stream: "Own Stream",
  };

  if (!livePlatform) {
    return null;
  }

  const platform = livePlatform.platform as PlatformType;
  const isLive = livePlatform.isLive;
  const title = livePlatform.streamTitle || platformLabels[platform];
  const viewerCount = livePlatform.viewerCount;

  return (
    <div className="w-full mb-8 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
      {/* Header with platform info */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-3 h-3 bg-red-400 rounded-full">
              <div className="absolute inset-0 bg-red-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <p className="text-sm text-red-100">{platformLabels[platform]}</p>
            </div>
          </div>
          {viewerCount && (
            <div className="text-sm text-red-100">
              {viewerCount.toLocaleString()} viewers
            </div>
          )}
        </div>
      </div>

      {/* Video player section */}
      <div className="relative bg-black w-full" style={{ aspectRatio: "16 / 9" }}>
        {platform === "youtube" && livePlatform.embedUrl && (
          <iframe
            src={livePlatform.embedUrl}
            title="YouTube Live"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {platform === "twitch" && livePlatform.embedUrl && (
          <iframe
            src={livePlatform.embedUrl}
            title="Twitch Live"
            className="w-full h-full"
            allowFullScreen
          />
        )}

        {platform === "own_stream" && livePlatform.streamUrl && (
          <ReactPlayer
            url={livePlatform.streamUrl}
            playing={true}
            controls={true}
            width="100%"
            height="100%"
          />
        )}

        {(platform === "tiktok" || platform === "instagram") && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
            <div className="text-center">
              <p className="text-white text-lg mb-4">
                {platformLabels[platform]} cannot be embedded directly
              </p>
              <a
                href={livePlatform.streamUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                Watch on {platformLabels[platform]}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Platform tabs (optional - could show other platforms that are online) */}
      {statuses.length > 1 && (
        <div className="border-t border-gray-700 px-6 py-3 flex gap-2 overflow-x-auto">
          {statuses.map((status) => {
            const plat = status.platform as PlatformType;
            const isCurrentPlatform = plat === platform;
            return (
              <div
                key={status.platform}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isCurrentPlatform
                    ? "bg-red-600 text-white"
                    : status.isLive
                      ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
                      : "bg-gray-800 text-gray-400"
                }`}
              >
                {status.isLive && (
                  <span className="inline-block w-2 h-2 bg-red-400 rounded-full mr-2" />
                )}
                {platformLabels[plat]}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
