/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Music, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function TrackRequests() {
  const [votedIds, setVotedIds] = useState<Set<number>>(
    new Set(JSON.parse(localStorage.getItem("track-votes") || "[]"))
  );

  const utils = trpc.useUtils();
  const { data: requests, isLoading } = trpc.trackRequests.list.useQuery({ limit: 10 });

  const upvote = trpc.trackRequests.upvote.useMutation({
    onSuccess: () => {
      utils.trackRequests.list.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to vote";
      toast.error(message);
    },
  });

  const handleVote = (id: number) => {
    if (votedIds.has(id)) {
      toast.info("You've already voted for this track");
      return;
    }
    upvote.mutate({ id });
    const newVotedIds = new Set(votedIds);
    newVotedIds.add(id);
    setVotedIds(newVotedIds);
    localStorage.setItem("track-votes", JSON.stringify(Array.from(newVotedIds)));
    toast.success("Vote counted!");
  };

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Music className="w-5 h-5" />
            Track Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading track requests...</p>
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Music className="w-5 h-5" />
            Track Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No track requests yet. Be the first to request a track!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
          <Music className="w-5 h-5" />
          Track Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-lg">
                      {request.trackTitle || "Unknown Track"}
                    </span>
                    {request.trackArtist && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{request.trackArtist}</span>
                      </>
                    )}
                  </div>
                  {request.trackStatus && (
                    <Badge
                      variant={
                        request.trackStatus === "played"
                          ? "default"
                          : request.trackStatus === "queued"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs mt-2"
                    >
                      {request.trackStatus}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-semibold text-accent">
                    <ThumbsUp className="w-4 h-4" />
                    {request.votes || 0}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVote(request.id)}
                    disabled={votedIds.has(request.id) || upvote.isPending}
                    className="shrink-0"
                  >
                    {votedIds.has(request.id) ? "Voted" : "Vote"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

