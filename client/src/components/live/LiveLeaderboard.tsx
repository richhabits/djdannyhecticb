/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Live Leaderboard Component - Top Donors & Chatters
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../../lib/trpc";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { TrendingUp, MessageSquare, Zap } from "lucide-react";

interface TopDonor {
  userId: number;
  userName: string | null;
  avatar: string | null;
  totalDonated: string;
  donationCount: number;
}

interface TopChatter {
  userId: number;
  userName: string | null;
  avatar: string | null;
  messageCount: number;
}

interface LiveLeaderboardProps {
  liveSessionId: number;
  maxRows?: number;
  period?: "24h" | "7d" | "alltime";
}

const medalEmojis = ["🥇", "🥈", "🥉"];

export function LiveLeaderboard({
  liveSessionId,
  maxRows = 10,
  period = "alltime",
}: LiveLeaderboardProps) {
  const [activeTab, setActiveTab] = useState("donors");

  // Get top donors
  const { data: topDonors, isLoading: donorsLoading } = useQuery({
    queryKey: ["live:leaderboard:topDonors", liveSessionId, period],
    queryFn: () =>
      trpc.live.leaderboard.topDonors.query({
        liveSessionId,
        period: period as any,
        limit: maxRows,
      }),
    refetchInterval: 15000,
  });

  // Get top chatters
  const { data: topChatters, isLoading: chattersLoading } = useQuery({
    queryKey: ["live:leaderboard:topChatters", liveSessionId],
    queryFn: () =>
      trpc.live.leaderboard.topChatters.query({
        liveSessionId,
        limit: maxRows,
      }),
    refetchInterval: 15000,
  });

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          <h2 className="font-bold text-lg">Live Leaderboard</h2>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b border-gray-800 bg-transparent rounded-none">
          <TabsTrigger
            value="donors"
            className={clsx(
              "flex-1 px-4 py-2 border-b-2 font-semibold transition-colors",
              activeTab === "donors"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            )}
          >
            💰 Top Donors
          </TabsTrigger>
          <TabsTrigger
            value="chatters"
            className={clsx(
              "flex-1 px-4 py-2 border-b-2 font-semibold transition-colors",
              activeTab === "chatters"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            )}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Top Chatters
          </TabsTrigger>
        </TabsList>

        {/* Donors Tab */}
        <TabsContent value="donors" className="p-0">
          <div className="divide-y divide-gray-800">
            {donorsLoading ? (
              <div className="p-6 text-center text-gray-400">
                Loading donors...
              </div>
            ) : !topDonors || topDonors.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No donations yet
              </div>
            ) : (
              topDonors.map((donor, idx) => (
                <motion.div
                  key={donor.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="px-4 py-3 hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className="w-8 text-center font-bold">
                      {idx < 3 ? (
                        <span className="text-2xl">{medalEmojis[idx]}</span>
                      ) : (
                        <span className="text-gray-500">#{idx + 1}</span>
                      )}
                    </div>

                    {/* Avatar & Name */}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={donor.avatar || ""} />
                      <AvatarFallback>
                        {donor.userName?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {donor.userName || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {donor.donationCount} donation
                        {donor.donationCount !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg text-green-400">
                        ${parseFloat(donor.totalDonated).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Donation Milestone Badge */}
                  {parseFloat(donor.totalDonated) >= 100 && (
                    <div className="mt-2 flex gap-1 ml-11">
                      {parseFloat(donor.totalDonated) >= 1000 && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">
                          👑 Founder
                        </span>
                      )}
                      {parseFloat(donor.totalDonated) >= 500 && (
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                          ⭐ VIP
                        </span>
                      )}
                      {parseFloat(donor.totalDonated) >= 100 && (
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                          💎 Supporter
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Chatters Tab */}
        <TabsContent value="chatters" className="p-0">
          <div className="divide-y divide-gray-800">
            {chattersLoading ? (
              <div className="p-6 text-center text-gray-400">
                Loading chatters...
              </div>
            ) : !topChatters || topChatters.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No messages yet
              </div>
            ) : (
              topChatters.map((chatter, idx) => (
                <motion.div
                  key={chatter.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="px-4 py-3 hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className="w-8 text-center font-bold">
                      {idx < 3 ? (
                        <span className="text-2xl">{medalEmojis[idx]}</span>
                      ) : (
                        <span className="text-gray-500">#{idx + 1}</span>
                      )}
                    </div>

                    {/* Avatar & Name */}
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={chatter.avatar || ""} />
                      <AvatarFallback>
                        {chatter.userName?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {chatter.userName || "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-400">
                        <Zap className="inline h-3 w-3 mr-1" />
                        Active chatter
                      </p>
                    </div>

                    {/* Message Count */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg text-blue-400">
                        {chatter.messageCount}
                      </p>
                      <p className="text-xs text-gray-400">messages</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-900/50 border-t border-gray-800 text-xs text-gray-500">
        Updates every 15 seconds
      </div>
    </div>
  );
}
