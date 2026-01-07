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

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Music, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminNowPlaying() {
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [note, setNote] = useState("");

  const utils = trpc.useUtils();
  const { data: nowPlaying } = trpc.tracks.nowPlaying.useQuery();
  const { data: history } = trpc.tracks.history.useQuery({ limit: 10 });

  const createTrack = trpc.tracks.create.useMutation({
    onSuccess: () => {
      toast.success("Track marked as now playing");
      setTitle("");
      setArtist("");
      setNote("");
      utils.tracks.nowPlaying.invalidate();
      utils.tracks.history.invalidate();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create track";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      toast.error("Title and artist are required");
      return;
    }
    createTrack.mutate({
      title: title.trim(),
      artist: artist.trim(),
      note: note.trim() || undefined,
    });
  };

  const handleRepeat = (track: { title: string; artist: string; note?: string | null }) => {
    setTitle(track.title);
    setArtist(track.artist);
    setNote(track.note || "");
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Admin Access Required</h1>
          <p className="text-muted-foreground">You must be an admin to access this page.</p>
          <Link href="/">
            <Button className="gradient-bg">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center gap-3">
            <Music className="w-8 h-8" />
            Now Playing Manager
          </h1>
          <p className="text-muted-foreground">
            Manually update what's playing on Hectic Radio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Track */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Current Track</CardTitle>
            </CardHeader>
            <CardContent>
              {nowPlaying ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{nowPlaying.title}</p>
                  <p className="text-muted-foreground">{nowPlaying.artist}</p>
                  {nowPlaying.note && (
                    <p className="text-sm text-muted-foreground">{nowPlaying.note}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Played {formatDistanceToNow(new Date(nowPlaying.playedAt), { addSuffix: true })}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No track set yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Add New Track */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Mark Track as Now Playing</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Track Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter track title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist *</Label>
                  <Input
                    id="artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Enter artist name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note (optional)</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Additional info..."
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full gradient-bg" disabled={createTrack.isPending}>
                  {createTrack.isPending ? "Updating..." : "Mark as Now Playing"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Track History */}
        {history && history.length > 0 && (
          <Card className="glass mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Tracks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{track.title}</p>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(track.playedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRepeat(track)}
                    >
                      Repeat
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

