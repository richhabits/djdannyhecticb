/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Live Poll Widget with Real-time Voting
 */

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "../../lib/trpc";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { CheckCircle2, Clock, BarChart3 } from "lucide-react";

interface Poll {
  id: number;
  question: string;
  options: string[];
  status: "active" | "closed" | "archived";
  totalVotes: number;
  voteCounts: Record<string, number>;
  expiresAt: Date;
}

interface PollWidgetProps {
  liveSessionId: number;
  onPollClosed?: (poll: Poll) => void;
}

export function PollWidget({ liveSessionId, onPollClosed }: PollWidgetProps) {
  const [userVoteIndex, setUserVoteIndex] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Get active poll
  const { data: activePoll, isLoading } = useQuery({
    queryKey: ["live:polls:active", liveSessionId],
    queryFn: () =>
      trpc.live.polls.getActive.query({
        liveSessionId,
      }),
    refetchInterval: 2000,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: (optionIndex: number) =>
      trpc.live.polls.vote.mutate({
        pollId: activePoll!.id,
        optionIndex,
      }),
    onSuccess: (data) => {
      setUserVoteIndex(data.optionIndex);
      toast.success("Vote recorded!");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to vote"
      );
    },
  });

  // Close poll mutation
  const closeMutation = useMutation({
    mutationFn: () =>
      trpc.live.polls.close.mutate({
        pollId: activePoll!.id,
      }),
    onSuccess: (closedPoll) => {
      toast.success("Poll closed!");
      if (onPollClosed) {
        onPollClosed(closedPoll);
      }
    },
  });

  // Calculate time remaining
  useEffect(() => {
    if (!activePoll || activePoll.status !== "active") return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiresAt = new Date(activePoll.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

      setTimeRemaining(remaining);

      if (remaining === 0) {
        closeMutation.mutate();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [activePoll, closeMutation]);

  if (isLoading) {
    return null;
  }

  if (!activePoll || activePoll.status !== "active") {
    return null;
  }

  const totalVotes = activePoll.totalVotes || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-lg p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-purple-400" />
            <h3 className="font-bold text-white">{activePoll.question}</h3>
          </div>
          <p className="text-xs text-gray-400">
            {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Timer */}
        {timeRemaining !== null && (
          <div
            className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold flex-shrink-0",
              timeRemaining <= 10
                ? "bg-red-500/20 text-red-300"
                : "bg-blue-500/20 text-blue-300"
            )}
          >
            <Clock className="h-3 w-3" />
            {timeRemaining}s
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {activePoll.options.map((option, idx) => {
          const votes = activePoll.voteCounts[idx] || 0;
          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
          const isUserVote = userVoteIndex === idx;

          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!userVoteIndex) {
                  voteMutation.mutate(idx);
                }
              }}
              disabled={!!userVoteIndex || voteMutation.isPending}
              className={clsx(
                "w-full p-2 rounded-lg transition-all text-left",
                isUserVote
                  ? "bg-green-500/20 border border-green-500"
                  : "bg-gray-900/50 border border-gray-700 hover:border-purple-500",
                !!userVoteIndex && !isUserVote && "opacity-50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isUserVote && (
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">{option}</span>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {percentage.toFixed(0)}%
                </span>
              </div>

              <div className="mt-1">
                <Progress value={percentage} className="h-1.5" />
              </div>

              <p className="text-xs text-gray-500 mt-0.5">{votes} votes</p>
            </motion.button>
          );
        })}
      </div>

      {/* Voted Message */}
      {userVoteIndex !== null && (
        <div className="px-3 py-2 bg-green-500/10 border border-green-500/30 rounded text-sm text-green-300 text-center font-medium">
          ✓ Your vote has been recorded
        </div>
      )}
    </motion.div>
  );
}
