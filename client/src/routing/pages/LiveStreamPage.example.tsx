/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Example: Complete Live Stream Page with All Engagement Features
 * This demonstrates how to integrate all components together
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { LiveChat } from "@/components/live/LiveChat";
import { DonationPanel } from "@/components/live/DonationPanel";
import { ReactionButtons } from "@/components/live/ReactionButtons";
import { LiveLeaderboard } from "@/components/live/LiveLeaderboard";
import { PollWidget } from "@/components/live/PollWidget";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Users,
  TrendingUp,
  Share2,
  Heart,
  Eye,
} from "lucide-react";
import clsx from "clsx";

interface LiveStreamPageProps {
  liveSessionId: number;
  streamerId: number;
  streamerName: string;
}

/**
 * Complete live stream page with all engagement features
 */
export function LiveStreamPage({
  liveSessionId,
  streamerId,
  streamerName,
}: LiveStreamPageProps) {
  const { user } = useAuth();
  const [showChat, setShowChat] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Get live session data
  const { data: session } = useQuery({
    queryKey: ["live:session", liveSessionId],
    queryFn: () =>
      trpc.live.stats.get.query({ streamerId }),
    refetchInterval: 5000,
  });

  // Get unread notifications
  const { data: unreadNotifications } = useQuery({
    queryKey: ["live:notifications:unread", liveSessionId],
    queryFn: () =>
      trpc.live.notifications.getUnread.query({
        liveSessionId,
      }),
    refetchInterval: 3000,
    enabled: !!user,
  });

  // Get streamer social links
  const { data: socialLinks } = useQuery({
    queryKey: ["live:social", streamerId],
    queryFn: () => trpc.live.social.getLinks.query({ userId: streamerId }),
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{streamerName}</h1>
            <p className="text-gray-400 mt-1">Live now on DJ Danny's Stream</p>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2 text-red-500 font-bold text-lg">
                <Eye className="h-5 w-5" />
                {session?.totalViewers || 0}
              </div>
              <p className="text-xs text-gray-400">Viewers</p>
            </div>

            <div className="text-center">
              <div className="flex items-center gap-2 text-green-500 font-bold text-lg">
                <Heart className="h-5 w-5" />
                ${parseFloat(session?.totalTips24h || "0").toFixed(2)}
              </div>
              <p className="text-xs text-gray-400">Tipped Today</p>
            </div>

            <div className="text-center">
              <div className="flex items-center gap-2 text-purple-500 font-bold text-lg">
                <TrendingUp className="h-5 w-5" />
                Lvl {session?.level || 1}
              </div>
              <p className="text-xs text-gray-400">Streamer Level</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Placeholder */}
            <div className="bg-black rounded-lg overflow-hidden aspect-video">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
                    <play-icon className="h-8 w-8" />
                  </div>
                  <p className="text-gray-400">Video Player</p>
                </div>
              </div>
            </div>

            {/* Reactions & Controls */}
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Support & Engage</h3>
                <ReactionButtons
                  liveSessionId={liveSessionId}
                  variant="full"
                  showCounts={true}
                />
              </div>

              {/* Poll Widget */}
              <PollWidget liveSessionId={liveSessionId} />

              {/* Social Links */}
              {socialLinks && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Follow {streamerName}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {socialLinks.twitterUrl && (
                      <Button
                        variant="outline"
                        className="border-gray-700"
                        onClick={() =>
                          window.open(socialLinks.twitterUrl, "_blank")
                        }
                      >
                        𝕏 Twitter
                      </Button>
                    )}
                    {socialLinks.instagramUrl && (
                      <Button
                        variant="outline"
                        className="border-gray-700"
                        onClick={() =>
                          window.open(socialLinks.instagramUrl, "_blank")
                        }
                      >
                        📷 Instagram
                      </Button>
                    )}
                    {socialLinks.tiktokUrl && (
                      <Button
                        variant="outline"
                        className="border-gray-700"
                        onClick={() =>
                          window.open(socialLinks.tiktokUrl, "_blank")
                        }
                      >
                        🎵 TikTok
                      </Button>
                    )}
                    {socialLinks.twitchUrl && (
                      <Button
                        variant="outline"
                        className="border-gray-700"
                        onClick={() =>
                          window.open(socialLinks.twitchUrl, "_blank")
                        }
                      >
                        🎮 Twitch
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Notifications Badge */}
            {unreadNotifications && unreadNotifications.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-300 text-sm font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  {unreadNotifications.length} New Event
                  {unreadNotifications.length !== 1 ? "s" : ""}
                </div>
              </div>
            )}

            {/* Donation Panel */}
            <DonationPanel
              liveSessionId={liveSessionId}
              streamerName={streamerName}
            />

            {/* Live Chat */}
            {showChat && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Live Chat
                  </h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowChat(false)}
                  >
                    ×
                  </Button>
                </div>
                <LiveChat
                  liveSessionId={liveSessionId}
                  isAdmin={user?.role === "admin"}
                  maxHeight="h-96"
                />
              </div>
            )}

            {/* Leaderboard */}
            {showLeaderboard && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Leaderboard
                  </h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowLeaderboard(false)}
                  >
                    ×
                  </Button>
                </div>
                <LiveLeaderboard
                  liveSessionId={liveSessionId}
                  maxRows={8}
                  period="alltime"
                />
              </div>
            )}

            {/* Toggle Panels */}
            <div className="flex gap-2">
              {!showChat && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowChat(true)}
                >
                  Show Chat
                </Button>
              )}
              {!showLeaderboard && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowLeaderboard(true)}
                >
                  Show Leaderboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example usage in App.tsx with routing
 */
export function ExampleUsage() {
  return (
    <>
      {/* Wrap with Stripe Elements provider in App.tsx */}
      <LiveStreamPage
        liveSessionId={123}
        streamerId={456}
        streamerName="DJ Danny"
      />
    </>
  );
}

/**
 * App.tsx integration:
 *
 * import { Elements } from "@stripe/react-stripe-js";
 * import { loadStripe } from "@stripe/stripe-js";
 *
 * const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);
 *
 * export function App() {
 *   return (
 *     <Elements stripe={stripePromise}>
 *       <LiveStreamPage
 *         liveSessionId={123}
 *         streamerId={456}
 *         streamerName="DJ Danny"
 *       />
 *     </Elements>
 *   );
 * }
 */
