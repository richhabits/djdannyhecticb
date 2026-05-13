/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Live Reaction Buttons with Combo Tracking
 */

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const REACTIONS = [
  { type: "fire", emoji: "🔥", label: "Fire", color: "from-orange-500 to-red-500" },
  { type: "love", emoji: "❤️", label: "Love", color: "from-red-500 to-pink-500" },
  { type: "hype", emoji: "🎉", label: "Hype", color: "from-purple-500 to-pink-500" },
  { type: "laugh", emoji: "😂", label: "Laugh", color: "from-yellow-500 to-orange-500" },
  { type: "sad", emoji: "😢", label: "Sad", color: "from-blue-500 to-cyan-500" },
  { type: "angry", emoji: "😠", label: "Angry", color: "from-red-500 to-orange-500" },
  { type: "thinking", emoji: "🤔", label: "Think", color: "from-gray-500 to-slate-500" },
];

interface ReactionCount {
  reactionType: string;
  count: number;
}

interface ComboMilestone {
  type: string;
  streak: number;
}

interface ReactionButtonsProps {
  liveSessionId: number;
  isEnabled?: boolean;
  showCounts?: boolean;
  variant?: "compact" | "full";
}

export function ReactionButtons({
  liveSessionId,
  isEnabled = true,
  showCounts = true,
  variant = "compact",
}: ReactionButtonsProps) {
  const [recentReactions, setRecentReactions] = useState<Map<string, number>>(
    new Map()
  );
  const [comboMilestones, setComboMilestones] = useState<ComboMilestone[]>([]);
  const [userReactionCooldowns, setUserReactionCooldowns] = useState<
    Set<string>
  >(new Set());

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: (reactionType: string) =>
      trpc.live.reactions.add.mutate({
        liveSessionId,
        reactionType: reactionType as any,
      }),
    onSuccess: (data) => {
      // Track combo milestone locally
      if (data.isComboMilestone) {
        setComboMilestones((prev) => [
          ...prev,
          { type: data.reactionType, streak: data.comboStreak },
        ]);
        setTimeout(() => {
          setComboMilestones((prev) =>
            prev.filter((m) => m.streak !== data.comboStreak)
          );
        }, 3000);
      }
    },
  });

  // Get reaction counts
  const { data: reactionCounts } = useQuery({
    queryKey: ["live:reactions:counts", liveSessionId],
    queryFn: () =>
      trpc.live.reactions.counts.query({
        liveSessionId,
        timeWindowSeconds: 10,
      }),
    refetchInterval: 500,
    enabled: showCounts,
  });

  // Handle reaction click with cooldown
  const handleReaction = (reactionType: string) => {
    if (!isEnabled) return;

    const cooldownKey = `reaction:${reactionType}`;

    if (userReactionCooldowns.has(cooldownKey)) {
      toast.error("Slow down! Wait before reacting again.");
      return;
    }

    // Add to cooldown
    setUserReactionCooldowns((prev) => new Set(prev).add(cooldownKey));

    // Remove after cooldown
    setTimeout(() => {
      setUserReactionCooldowns((prev) => {
        const next = new Set(prev);
        next.delete(cooldownKey);
        return next;
      });
    }, 500); // 500ms cooldown between reactions

    addReactionMutation.mutate(reactionType);
  };

  useEffect(() => {
    if (reactionCounts) {
      const counts = new Map<string, number>();
      reactionCounts.forEach((rc: ReactionCount) => {
        counts.set(rc.reactionType, rc.count);
      });
      setRecentReactions(counts);
    }
  }, [reactionCounts]);

  return (
    <div className="space-y-3">
      {/* Reaction Buttons */}
      <div
        className={clsx(
          "flex flex-wrap gap-2",
          variant === "compact" ? "justify-center" : "justify-start"
        )}
      >
        {REACTIONS.map((reaction) => {
          const count = recentReactions.get(reaction.type) || 0;
          const isOnCooldown = userReactionCooldowns.has(`reaction:${reaction.type}`);

          return (
            <motion.button
              key={reaction.type}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleReaction(reaction.type)}
              disabled={!isEnabled || isOnCooldown}
              className={clsx(
                "relative px-3 py-2 rounded-lg font-semibold transition-all",
                isOnCooldown
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-100 cursor-pointer",
                variant === "compact"
                  ? "text-sm min-w-fit"
                  : "text-base flex-1",
                `bg-gradient-to-r ${reaction.color} text-white shadow-lg hover:shadow-xl`
              )}
              title={reaction.label}
            >
              <span className="text-lg mr-1">{reaction.emoji}</span>
              {showCounts && count > 0 && (
                <span className="text-xs font-bold bg-black/30 px-2 py-0.5 rounded-full ml-1">
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Combo Milestones Display */}
      <AnimatePresence>
        {comboMilestones.map((milestone, idx) => {
          const reaction = REACTIONS.find((r) => r.type === milestone.type);
          return (
            <motion.div
              key={`${milestone.type}-${milestone.streak}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={clsx(
                "px-4 py-2 rounded-lg text-white font-bold text-center",
                `bg-gradient-to-r ${reaction?.color}`
              )}
            >
              🔥 {milestone.streak}x COMBO! {reaction?.emoji}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Reaction Stats Summary */}
      {showCounts && recentReactions.size > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 font-semibold mb-2">
            Live Reactions (10s window)
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(recentReactions.entries()).map(
              ([type, count]) => {
                const reaction = REACTIONS.find((r) => r.type === type);
                return (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-xs"
                  >
                    <span>{reaction?.emoji}</span>
                    <span className="font-bold text-purple-300">{count}</span>
                  </span>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}
