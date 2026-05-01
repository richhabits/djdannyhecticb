import { useState } from "react";
import { StreamerLiveLayout } from "@/components/StreamerLiveLayout";
import { LeaderboardWidget } from "@/components/LeaderboardWidget";
import { MetaTagsComponent } from "@/components/MetaTags";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function LiveNew() {
  const { data: activeStream } = trpc.streams.active.useQuery(undefined, {
    retry: false,
  });

  const handleFollowClick = () => {
    toast.success("Thanks for following! You'll get notifications for new streams.");
  };

  const handleSubscribeClick = () => {
    toast.info("Subscribe feature would open subscription modal");
  };

  const handleDonateClick = () => {
    toast.info("Donate feature would open donation dialog");
  };

  const streamerInfo = {
    name: "DJ Danny Hectic B",
    title: activeStream?.name || "Hectic Radio Live",
    category: "Music / Electronic / House",
    socialLinks: [
      {
        platform: "instagram",
        url: "https://instagram.com/dj.danny.hectic.b",
        username: "@dj.danny.hectic.b",
      },
      {
        platform: "twitter",
        url: "https://twitter.com/djdannyhectic",
        username: "@djdannyhectic",
      },
      {
        platform: "tiktok",
        url: "https://tiktok.com/@djdannyhectic",
        username: "@djdannyhectic",
      },
      {
        platform: "twitch",
        url: "https://twitch.tv/djdannyhectic",
        username: "djdannyhectic",
      },
      {
        platform: "youtube",
        url: "https://youtube.com/@djdannyhectic",
        username: "@djdannyhectic",
      },
    ],
  };

  return (
    <>
      <MetaTagsComponent
        title="Hectic Radio - Live | DJ Danny Hectic B"
        description="Lock in with DJ Danny Hectic B on Hectic Radio. Listen live, request tracks, send shouts, and vibe with the crew. Professional streaming experience with real-time chat, donations, and leaderboard."
        url="/live"
        type="music.radio_station"
      />

      {/* Streamer Live Layout - Main Component */}
      <StreamerLiveLayout
        streamerName={streamerInfo.name}
        streamTitle={streamerInfo.title}
        category={streamerInfo.category}
        socialLinks={streamerInfo.socialLinks}
        onFollowClick={handleFollowClick}
        onSubscribeClick={handleSubscribeClick}
        onDonateClick={handleDonateClick}
      />
    </>
  );
}
