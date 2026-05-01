import { useState, useEffect } from "react";
import { VideoPlayerSection } from "./VideoPlayerSection";
import { ViewerStats } from "./ViewerStats";
import { InteractionPanel } from "./InteractionPanel";
import { MobileBottomSheet } from "./MobileBottomSheet";
import { StreamHealthIndicator } from "./StreamHealthIndicator";
import { StreamEventLog } from "./StreamEventLog";
import { ProductPanel } from "./ProductPanel";
import { QualitySelector } from "./QualitySelector";
import { StreamAnalytics } from "./StreamAnalytics";
import { UpcomingEvents } from "./UpcomingEvents";
import { AlertContainer } from "./AlertContainer";
import { useStreamEvents } from "@/_core/hooks/useStreamEvents";
import { useAlertQueue } from "@/hooks/useAlertQueue";
import { Card } from "@/components/ui/card";
import { Music, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Donation {
  id: string;
  donor: string;
  amount: number;
  message?: string;
  timestamp: Date;
}

interface Raid {
  id: string;
  raiderName: string;
  raidCount: number;
  timestamp: Date;
}

interface Subscriber {
  id: string;
  subscriberName: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  months: number;
  message?: string;
  timestamp: Date;
}

interface StreamEvent {
  id: string;
  type: "follow" | "subscribe" | "donation" | "raid";
  username: string;
  timestamp: Date;
}

export interface StreamerLiveLayoutProps {
  streamerName?: string;
  streamTitle?: string;
  category?: string;
  socialLinks?: {
    platform: string;
    url: string;
    username: string;
  }[];
  bannerImage?: string;
  onFollowClick?: () => void;
  onSubscribeClick?: () => void;
  onDonateClick?: () => void;
}

export function StreamerLiveLayout({
  streamerName = "DJ Danny Hectic B",
  streamTitle = "Morning Vibes Mix",
  category = "Music / Electronic",
  socialLinks = [
    { platform: "instagram", url: "https://instagram.com", username: "@dj.danny.hectic.b" },
    { platform: "twitter", url: "https://twitter.com", username: "@djdannyhectic" },
    { platform: "tiktok", url: "https://tiktok.com", username: "@djdannyhectic" },
  ],
  onFollowClick,
  onSubscribeClick,
  onDonateClick,
}: StreamerLiveLayoutProps) {
  const { alerts, add: addAlert, dismiss: dismissAlert } = useAlertQueue();
  const [viewerCount, setViewerCount] = useState(2847);
  const [isLiked, setIsLiked] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [raids, setRaids] = useState<Raid[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [streamDuration, setStreamDuration] = useState(1800); // 30 minutes in seconds
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentQuality, setCurrentQuality] = useState("auto");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);

  // Simulate viewer count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => {
        const change = Math.floor((Math.random() - 0.45) * 100);
        return Math.max(1000, prev + change);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update stream duration
  useEffect(() => {
    const interval = setInterval(() => {
      setStreamDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleDonation = (amount: number, message?: string) => {
    const donation: Donation = {
      id: Date.now().toString(),
      donor: `Supporter_${Math.floor(Math.random() * 10000)}`,
      amount,
      message,
      timestamp: new Date(),
    };
    setDonations((prev) => [...prev, donation]);
    // Remove after animation
    setTimeout(() => {
      setDonations((prev) => prev.filter((d) => d.id !== donation.id));
    }, 5000);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Connect to real-time stream events
  useStreamEvents({
    onDonation: (donor, amount, message) => {
      const donation: Donation = {
        id: Date.now().toString(),
        donor,
        amount,
        message,
        timestamp: new Date(),
      };
      setDonations((prev) => [...prev, donation]);
      setStreamEvents((prev) => [
        { id: donation.id, type: "donation", username: donor, timestamp: new Date() },
        ...prev.slice(0, 49),
      ]);
      // Add to alert queue
      addAlert({
        type: 'donation',
        title: 'Donation Received',
        message: `${donor} donated $${amount}`,
        data: {
          username: donor,
          amount,
          message,
        },
      });
      setTimeout(() => setDonations((prev) => prev.filter((d) => d.id !== donation.id)), 6000);
    },
    onRaid: (raiderName, raidCount) => {
      const raid: Raid = {
        id: Date.now().toString(),
        raiderName,
        raidCount,
        timestamp: new Date(),
      };
      setRaids((prev) => [...prev, raid]);
      setStreamEvents((prev) => [
        { id: raid.id, type: "raid", username: raiderName, timestamp: new Date() },
        ...prev.slice(0, 49),
      ]);
      // Add to alert queue
      addAlert({
        type: 'raid',
        title: 'RAID INCOMING!',
        message: `${raiderName} raided with ${raidCount} viewers`,
        data: {
          username: raiderName,
          raidCount,
        },
      });
      setTimeout(() => setRaids((prev) => prev.filter((r) => r.id !== raid.id)), 8000);
    },
    onSubscribe: (username, tier, months, message) => {
      const subscriber: Subscriber = {
        id: Date.now().toString(),
        subscriberName: username,
        tier: tier as "bronze" | "silver" | "gold" | "platinum",
        months,
        message,
        timestamp: new Date(),
      };
      setSubscribers((prev) => [...prev, subscriber]);
      setStreamEvents((prev) => [
        { id: subscriber.id, type: "subscribe", username, timestamp: new Date() },
        ...prev.slice(0, 49),
      ]);
      // Add to alert queue
      addAlert({
        type: 'subscribe',
        title: 'NEW SUBSCRIBER!',
        message: `${username} subscribed for ${months} month${months !== 1 ? 's' : ''}`,
        data: {
          username,
          tier,
          months,
          message,
        },
      });
      setTimeout(
        () => setSubscribers((prev) => prev.filter((s) => s.id !== subscriber.id)),
        7000
      );
    },
    onFollow: (username) => {
      setStreamEvents((prev) => [
        {
          id: Date.now().toString(),
          type: "follow",
          username,
          timestamp: new Date(),
        },
        ...prev.slice(0, 49),
      ]);
      // Add to alert queue
      addAlert({
        type: 'follow',
        title: 'NEW FOLLOWER!',
        message: `${username} followed the stream`,
        data: {
          username,
        },
      });
    },
  });

  return (
    <div className="w-full bg-background text-foreground">
      {/* Unified Alert Container - Centralized queue management */}
      <AlertContainer alerts={alerts} onDismiss={dismissAlert} />

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="desktop:flex h-screen overflow-hidden gap-1 p-1 bg-background wide:max-w-7xl wide:mx-auto">
          {/* Left: Video Player (70% desktop, 60% tablet) */}
          <div className="flex-1 min-w-0 flex flex-col desktop:w-[70%] tablet:w-[60%]">
            {/* Stream Health & Quality Controls */}
            <div className="bg-[#1F1F1F] border-b border-[#333333] px-3 py-2 md:px-4 flex items-center justify-between gap-2 md:gap-3 text-xs md:text-sm">
              <StreamHealthIndicator bitrate={5000} fps={60} resolution="1080p" />
              <QualitySelector
                currentQuality={currentQuality}
                onQualityChange={setCurrentQuality}
              />
            </div>

            <VideoPlayerSection
              streamerName={streamerName}
              streamTitle={streamTitle}
              category={category}
            />

            {/* Bottom Stats Bar with Event Log */}
            <div className="bg-[#1F1F1F] border-t border-[#333333] px-3 py-2 md:px-4 md:py-3">
              <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
                <ViewerStats
                  viewerCount={viewerCount}
                  streamDuration={formatDuration(streamDuration)}
                  donationsRaised={donations.reduce((sum, d) => sum + d.amount, 0)}
                />
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="text-xs px-2 py-1 md:px-3 rounded bg-[#2F2F2F] hover:bg-[#3F3F3F] text-white transition whitespace-nowrap"
                >
                  {showAnalytics ? "Hide" : "Stats"}
                </button>
              </div>

              {showAnalytics && (
                <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-[#333333]">
                  <StreamAnalytics />
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar (30% desktop, 40% tablet, hidden mobile) */}
          <div className="hidden tablet:flex tablet:w-[40%] desktop:w-[30%] flex-col bg-[#1F1F1F] border-l border-[#333333] overflow-hidden">
            {/* Streamer Info Card */}
            <div className="p-4 border-b border-[#333333] flex-shrink-0">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{streamerName}</h3>
                  <p className="text-xs text-[#999999]">{category}</p>
                  <div className="flex gap-1 mt-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#FF4444] animate-pulse" />
                    <span className="text-xs text-[#999999]">LIVE</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={onFollowClick}
                  className="w-full bg-white text-black hover:bg-gray-200 font-bold h-8 text-xs"
                >
                  + FOLLOW
                </Button>
                <Button
                  onClick={onSubscribeClick}
                  className="w-full bg-[#FF4444] text-white hover:bg-[#FF5555] font-bold h-8 text-xs"
                >
                  SUBSCRIBE
                </Button>
              </div>

              {/* Social Links */}
              <div className="flex gap-2 mt-3 justify-center">
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded bg-[#2F2F2F] hover:bg-[#FF4444] transition-colors flex items-center justify-center text-xs font-bold"
                    title={link.platform}
                  >
                    {link.platform[0].toUpperCase()}
                  </a>
                ))}
              </div>
            </div>

            {/* Event Log / Product Tabs */}
            <div className="border-b border-[#333333] flex">
              <button className="flex-1 text-xs font-bold text-white bg-[#FF4444] p-3">
                Products
              </button>
              <button className="flex-1 text-xs font-bold text-[#999999] p-3 hover:text-white transition">
                Activity
              </button>
            </div>

            {/* Product Panel */}
            <div className="p-3 border-b border-[#333333] flex-shrink-0">
              <ProductPanel />
            </div>

            {/* Upcoming Events */}
            <div className="p-3 border-b border-[#333333] flex-shrink-0 max-h-64 overflow-y-auto">
              <UpcomingEvents maxEvents={3} compact={true} />
            </div>

            {/* Interaction Panel */}
            <div className="p-3 border-b border-[#333333] flex-shrink-0">
              <InteractionPanel
                onReaction={(type) => console.log("Reaction:", type)}
                onPollVote={(option) => console.log("Poll vote:", option)}
                onFollowClick={onFollowClick}
              />
            </div>

            {/* Chat Area - Scrollable */}
            <div className="flex-1 overflow-hidden flex flex-col bg-[#0A0A0A]">
              <div className="p-3 border-b border-[#333333] flex items-center justify-between">
                <h4 className="text-xs font-bold">LIVE CHAT</h4>
                <span className="text-xs bg-[#FF4444] text-white px-2 py-1 rounded">
                  TOP DONORS
                </span>
              </div>

              {/* Mock Chat/Leaderboard */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {/* Top Donors List */}
                <div className="space-y-2">
                  {[
                    { name: "IceKing99", amount: 500, emoji: "👑" },
                    { name: "VibeChecker", amount: 250, emoji: "🎧" },
                    { name: "SoundWave", amount: 150, emoji: "🌊" },
                    { name: "BeatMaster", amount: 100, emoji: "🔥" },
                    { name: "MusicLover", amount: 50, emoji: "🎵" },
                  ].map((donor, idx) => (
                    <div
                      key={idx}
                      className="text-xs px-2 py-2 rounded bg-[#2F2F2F] hover:bg-[#3F3F3F] transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{donor.emoji}</span>
                        <span className="font-bold flex-1 truncate">{donor.name}</span>
                        <span className="text-[#FF4444] font-bold">
                          ${donor.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sample Messages */}
                <div className="mt-4 space-y-1 text-xs">
                  <div className="px-2 py-1 text-[#999999]">
                    <span className="text-white font-bold">@DJ_Fan:</span> Vibes are immaculate!
                  </div>
                  <div className="px-2 py-1 text-[#999999]">
                    <span className="text-white font-bold">@StreamKing:</span> FIRE DROP 🔥
                  </div>
                  <div className="px-2 py-1 text-[#999999]">
                    <span className="text-white font-bold">@MusicHead:</span> What track is this?
                  </div>
                </div>
              </div>

              {/* Event Log Tab Content */}
            {/* (Hidden by default, shown via tab click) */}

            {/* Donation Button */}
              <div className="p-3 border-t border-[#333333] flex-shrink-0">
                <Button
                  onClick={onDonateClick}
                  className="w-full bg-[#FF4444] text-white hover:bg-[#FF5555] font-bold h-10"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  DONATE NOW
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div className="flex flex-col h-screen overflow-hidden">
          {/* Video Player (Full Width) */}
          <VideoPlayerSection
            streamerName={streamerName}
            streamTitle={streamTitle}
            category={category}
          />

          {/* Bottom Action Bar - Responsive padding */}
          <div className="bg-[#1F1F1F] border-t border-[#333333] px-2 md:px-3 py-1.5 md:py-2">
            <div className="flex items-center justify-between gap-2 mb-1.5 md:mb-2">
              <ViewerStats
                viewerCount={viewerCount}
                streamDuration={formatDuration(streamDuration)}
                donationsRaised={donations.reduce((sum, d) => sum + d.amount, 0)}
                compact
              />
            </div>

            {/* Quick Actions - Touch-friendly buttons */}
            <div className="flex gap-1.5 md:gap-2">
              <Button
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={`flex-1 h-10 min-h-[44px] text-xs ${
                  isLiked
                    ? "bg-[#FF4444] text-white"
                    : "bg-[#2F2F2F] text-white hover:bg-[#3F3F3F]"
                }`}
              >
                <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                Like
              </Button>
              <Button
                size="sm"
                className="flex-1 h-10 min-h-[44px] text-xs bg-[#2F2F2F] text-white hover:bg-[#3F3F3F]"
              >
                <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                Share
              </Button>
              <Button
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="flex-1 h-10 min-h-[44px] text-xs bg-[#FF4444] text-white hover:bg-[#FF5555]"
              >
                Chat
              </Button>
            </div>
          </div>

          {/* Mobile Chat Bottom Sheet */}
          {showChat && <MobileBottomSheet onClose={() => setShowChat(false)} />}

          {/* Mobile Interaction Panel - Responsive padding */}
          <div className="bg-[#0A0A0A] border-t border-[#333333] px-2 md:px-3 py-1.5 md:py-2">
            <InteractionPanel
              onReaction={(type) => console.log("Reaction:", type)}
              onPollVote={(option) => console.log("Poll vote:", option)}
              onFollowClick={onFollowClick}
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
}
