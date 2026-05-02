/**
 * Live Streaming Components - Usage Examples
 * Real-world examples of implementing the live streaming system
 */

import { useState, useEffect } from "react";
import { StreamerLiveLayout } from "./StreamerLiveLayout";
import { VideoPlayerSection } from "./VideoPlayerSection";
import { ViewerStats } from "./ViewerStats";
import { InteractionPanel } from "./InteractionPanel";
import { DonationAlert } from "./DonationAlert";
import { LeaderboardWidget } from "./LeaderboardWidget";
import { MobileBottomSheet } from "./MobileBottomSheet";
import { toast } from "sonner";

/**
 * Example 1: Basic Live Page
 * Minimal setup with just the main layout component
 */
export function BasicLivePageExample() {
  return (
    <StreamerLiveLayout
      streamerName="DJ Danny Hectic B"
      streamTitle="Morning Vibes Mix"
      category="Music / Electronic"
      onFollowClick={() => {
        toast.success("Thanks for following!");
      }}
      onSubscribeClick={() => {
        toast.info("Opening subscription modal...");
      }}
      onDonateClick={() => {
        toast.info("Opening donation dialog...");
      }}
    />
  );
}

/**
 * Example 2: Advanced Live Page with Custom Handlers
 * Full implementation with custom logic
 */
export function AdvancedLivePageExample() {
  const [followers, setFollowers] = useState(0);
  const [subscribers, setSubscribers] = useState(0);
  const [totalDonated, setTotalDonated] = useState(0);

  const handleFollowClick = async () => {
    try {
      // Call your API
      // const response = await api.follow(userId);
      setFollowers((prev) => prev + 1);
      toast.success("Thanks for the follow!");
    } catch (error) {
      toast.error("Failed to follow. Please try again.");
    }
  };

  const handleSubscribeClick = () => {
    // Open subscription modal
    // modalManager.open("subscription", { tier: "pro" });
    toast.info("Subscription feature coming soon!");
  };

  const handleDonateClick = () => {
    // Open donation dialog with Stripe integration
    // donationModal.open();
    toast.info("Donation feature coming soon!");
  };

  return (
    <StreamerLiveLayout
      streamerName="DJ Danny Hectic B"
      streamTitle="Late Night Chill Session"
      category="Music / Electronic / Ambient"
      socialLinks={[
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
          platform: "twitch",
          url: "https://twitch.tv/djdannyhectic",
          username: "djdannyhectic",
        },
      ]}
      onFollowClick={handleFollowClick}
      onSubscribeClick={handleSubscribeClick}
      onDonateClick={handleDonateClick}
    />
  );
}

/**
 * Example 3: Custom Video Player Implementation
 * Using just the VideoPlayerSection component
 */
export function CustomVideoPlayerExample() {
  const [platform, setPlatform] = useState<
    "youtube" | "twitch" | "tiktok" | "instagram" | "own"
  >("youtube");

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Platform Selector */}
      <div className="flex gap-2">
        {(["youtube", "twitch", "tiktok", "instagram", "own"] as const).map(
          (p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-4 py-2 rounded font-bold transition-colors ${
                platform === p
                  ? "bg-[#FF4444] text-white"
                  : "bg-[#2F2F2F] text-white hover:bg-[#3F3F3F]"
              }`}
            >
              {p.toUpperCase()}
            </button>
          )
        )}
      </div>

      {/* Video Player */}
      <VideoPlayerSection
        streamerName="DJ Danny Hectic B"
        streamTitle="Multi-Platform Stream"
        category="Music"
        platform={platform}
      />

      {/* Stats Below */}
      <ViewerStats
        viewerCount={2847}
        streamDuration="1:23:45"
        donationsRaised={1250}
      />
    </div>
  );
}

/**
 * Example 4: Donation System Integration
 * Handling donations and showing alerts
 */
export function DonationSystemExample() {
  const [donations, setDonations] = useState<
    Array<{
      id: string;
      donor: string;
      amount: number;
      message?: string;
      timestamp: Date;
    }>
  >([]);

  const handleNewDonation = (amount: number, message?: string) => {
    const donation = {
      id: Date.now().toString(),
      donor: `Supporter_${Math.floor(Math.random() * 10000)}`,
      amount,
      message,
      timestamp: new Date(),
    };

    setDonations((prev) => [...prev, donation]);

    // Auto-remove after animation
    setTimeout(() => {
      setDonations((prev) => prev.filter((d) => d.id !== donation.id));
    }, 5000);

    // You could also:
    // - Save to database
    // - Track for leaderboard
    // - Trigger thank you email
    // - Update total raised counter
  };

  return (
    <div className="w-full space-y-6 p-4">
      {/* Donation Alerts Container */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none space-y-3">
        {donations.map((donation) => (
          <DonationAlert key={donation.id} donation={donation} />
        ))}
      </div>

      {/* Test Donation Buttons */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Test Donations</h2>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleNewDonation(5, "Love the vibes!")}
            className="px-4 py-2 bg-[#FF4444] text-white rounded font-bold hover:bg-[#FF5555]"
          >
            $5 Donation
          </button>
          <button
            onClick={() => handleNewDonation(10)}
            className="px-4 py-2 bg-[#FF4444] text-white rounded font-bold hover:bg-[#FF5555]"
          >
            $10 Donation
          </button>
          <button
            onClick={() =>
              handleNewDonation(50, "Amazing set, DJ Danny!")
            }
            className="px-4 py-2 bg-[#FF4444] text-white rounded font-bold hover:bg-[#FF5555]"
          >
            $50 Donation
          </button>
          <button
            onClick={() => handleNewDonation(100, "Keep it going!")}
            className="px-4 py-2 bg-[#FF4444] text-white rounded font-bold hover:bg-[#FF5555]"
          >
            $100 Donation
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 p-4 bg-[#1F1F1F] rounded">
          <p className="text-white">
            Total Donations This Session:{" "}
            <span className="text-[#FF4444] font-bold">
              ${donations.reduce((sum, d) => sum + d.amount, 0)}
            </span>
          </p>
          <p className="text-[#999999] text-sm mt-2">
            Alerts shown: {donations.length}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 5: Interactive Polls and Reactions
 * Using the InteractionPanel component
 */
export function InteractivePollExample() {
  const [reactions, setReactions] = useState<Record<string, number>>({
    love: 0,
    fire: 0,
    hype: 0,
    vibes: 0,
  });

  const handleReaction = (type: string) => {
    setReactions((prev) => ({
      ...prev,
      [type]: (prev[type as keyof typeof prev] || 0) + 1,
    }));
  };

  const handlePollVote = (option: string) => {
    console.log("Poll vote:", option);
    toast.success(`Voted for: ${option}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Main Interaction Panel */}
      <div className="bg-[#1F1F1F] rounded-lg p-6 border border-[#333333]">
        <InteractionPanel
          onReaction={handleReaction}
          onPollVote={handlePollVote}
          onFollowClick={() => toast.success("Followed!")}
        />
      </div>

      {/* Reaction Stats */}
      <div className="bg-[#1F1F1F] rounded-lg p-6 border border-[#333333]">
        <h3 className="text-white font-bold mb-4">Reaction Stats</h3>
        <div className="space-y-2">
          {[
            { emoji: "❤️", label: "Love", key: "love" },
            { emoji: "🔥", label: "Fire", key: "fire" },
            { emoji: "🙌", label: "Hype", key: "hype" },
            { emoji: "✨", label: "Vibes", key: "vibes" },
          ].map((reaction) => (
            <div key={reaction.key} className="flex items-center gap-4">
              <span className="text-2xl">{reaction.emoji}</span>
              <span className="text-white flex-1">{reaction.label}</span>
              <span className="text-[#FF4444] font-bold">
                {reactions[reaction.key as keyof typeof reactions] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Example 6: Leaderboard Display
 * Showing top donors and active chatters
 */
export function LeaderboardExample() {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <LeaderboardWidget
        title="Top Supporters"
        type="donors"
        entries={[
          {
            rank: 1,
            name: "CryptoKing",
            value: 1000,
            type: "donor",
            avatar: "👑",
            badge: "gold",
            trend: "up",
          },
          {
            rank: 2,
            name: "MusicLover",
            value: 500,
            type: "donor",
            avatar: "🎵",
            badge: "silver",
            trend: "stable",
          },
          {
            rank: 3,
            name: "VibeChecker",
            value: 250,
            type: "donor",
            avatar: "🎧",
            badge: "bronze",
            trend: "up",
          },
          {
            rank: 4,
            name: "StreamKing",
            value: 150,
            type: "donor",
            avatar: "👑",
            trend: "down",
          },
          {
            rank: 5,
            name: "FanSupreme",
            value: 100,
            type: "donor",
            avatar: "⭐",
            trend: "stable",
          },
        ]}
      />
    </div>
  );
}

/**
 * Example 7: Mobile Chat Bottom Sheet
 * Mobile-specific chat interface
 */
export function MobileBottomSheetExample() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="w-full space-y-4 p-4">
      <button
        onClick={() => setShowChat(!showChat)}
        className="w-full px-4 py-3 bg-[#FF4444] text-white rounded font-bold hover:bg-[#FF5555]"
      >
        {showChat ? "Close Chat" : "Open Chat"}
      </button>

      {showChat && <MobileBottomSheet onClose={() => setShowChat(false)} />}
    </div>
  );
}

/**
 * Example 8: Responsive Layout Handling
 * Showing how layout adapts to screen size
 */
export function ResponsiveLayoutExample() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full space-y-4 p-4">
      <div className="bg-[#1F1F1F] p-4 rounded border border-[#333333]">
        <p className="text-white">
          Current Layout:{" "}
          <span className="text-[#FF4444] font-bold">
            {isMobile ? "MOBILE" : "DESKTOP"}
          </span>
        </p>
        <p className="text-[#999999] text-sm mt-2">
          Window width: {window.innerWidth}px
        </p>
      </div>

      <p className="text-[#999999] text-sm">
        {isMobile
          ? "Mobile layout: Full-width video, bottom chat sheet"
          : "Desktop layout: 70/30 split, sidebar chat"}
      </p>
    </div>
  );
}

/**
 * Example 9: Full Featured Live Stream
 * Complete implementation with all features
 */
export function FullFeaturedLiveStreamExample() {
  const [donations, setDonations] = useState<any[]>([]);
  const [viewerCount, setViewerCount] = useState(2847);
  const [streamDuration, setStreamDuration] = useState("1:23:45");

  return (
    <div className="w-full space-y-6">
      {/* Donation Alerts */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none space-y-3">
        {donations.map((donation) => (
          <DonationAlert key={donation.id} donation={donation} />
        ))}
      </div>

      {/* Main Stream */}
      <StreamerLiveLayout
        streamerName="DJ Danny Hectic B"
        streamTitle="Full Featured Stream"
        category="Music / Electronic / House"
        socialLinks={[
          {
            platform: "instagram",
            url: "https://instagram.com",
            username: "@dj.danny",
          },
          {
            platform: "twitter",
            url: "https://twitter.com",
            username: "@djdanny",
          },
          {
            platform: "twitch",
            url: "https://twitch.tv",
            username: "djdanny",
          },
        ]}
        onFollowClick={() => {
          toast.success("Thanks for following!");
        }}
        onSubscribeClick={() => {
          toast.info("Subscribe feature coming soon!");
        }}
        onDonateClick={() => {
          // Simulate donation
          const amount = [5, 10, 25, 50][Math.floor(Math.random() * 4)];
          const donation = {
            id: Date.now().toString(),
            donor: `Supporter_${Math.floor(Math.random() * 10000)}`,
            amount,
            message: "Thanks for the stream!",
            timestamp: new Date(),
          };
          setDonations((prev) => [...prev, donation]);
          setTimeout(() => {
            setDonations((prev) =>
              prev.filter((d) => d.id !== donation.id)
            );
          }, 5000);
          toast.success(`Donated $${amount}!`);
        }}
      />
    </div>
  );
}

export default {
  BasicLivePageExample,
  AdvancedLivePageExample,
  CustomVideoPlayerExample,
  DonationSystemExample,
  InteractivePollExample,
  LeaderboardExample,
  MobileBottomSheetExample,
  ResponsiveLayoutExample,
  FullFeaturedLiveStreamExample,
};
