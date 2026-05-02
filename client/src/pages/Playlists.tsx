/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@shared/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Share2, Heart, Play, GripVertical, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface Playlist {
  id: string;
  userId: number;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  status: "draft" | "published";
  isCollaborative: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  itemCount?: number;
  followerCount?: number;
  creator?: {
    id: number;
    name?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
  clips?: any[];
  isFollowing?: boolean;
}

export default function Playlists() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [activeTab, setActiveTab] = useState("public");

  // Fetch my playlists
  const { data: myPlaylists, isLoading: myLoading } = useQuery({
    queryKey: ["playlist.myPlaylists", user?.id],
    queryFn: () => (user ? trpc.content.playlist.myPlaylists.query() : null),
    enabled: !!user,
  });

  // Fetch public playlists
  const { data: publicPlaylists, isLoading: publicLoading } = useQuery({
    queryKey: ["playlist.public"],
    queryFn: () => trpc.content.playlist.public.query(),
  });

  // Fetch playlist details
  const { data: playlistDetail } = useQuery({
    queryKey: ["playlist.byId", selectedPlaylist?.id],
    queryFn: () =>
      selectedPlaylist ? trpc.content.playlist.byId.query({ id: selectedPlaylist.id }) : null,
    enabled: !!selectedPlaylist,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: (playlistId: string) =>
      trpc.content.playlist.follow.mutate({ playlistId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlist.byId"] });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Playlists</h1>
          <p className="text-slate-400">Curate and share your favorite clip collections</p>
        </div>

        {/* Create Playlist Button */}
        {user && (
          <div className="mb-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Playlist
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle>Create New Playlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Playlist Title" className="bg-slate-700 border-slate-600" />
                  <Textarea
                    placeholder="Description (optional)"
                    className="bg-slate-700 border-slate-600"
                  />
                  <Button className="w-full">Create Playlist</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="public">Discover</TabsTrigger>
            {user && <TabsTrigger value="my-playlists">My Playlists</TabsTrigger>}
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          {/* Public Playlists Tab */}
          <TabsContent value="public" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicLoading ? (
                <div className="col-span-full text-center py-12">Loading...</div>
              ) : publicPlaylists?.length ? (
                publicPlaylists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onSelect={setSelectedPlaylist}
                    onFollow={followMutation.mutate}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-400">
                  No playlists yet
                </div>
              )}
            </div>
          </TabsContent>

          {/* My Playlists Tab */}
          {user && (
            <TabsContent value="my-playlists" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myLoading ? (
                  <div className="col-span-full text-center py-12">Loading...</div>
                ) : myPlaylists?.length ? (
                  myPlaylists.map((playlist) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      onSelect={setSelectedPlaylist}
                      isOwner={true}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-slate-400">
                    No playlists yet. Create one!
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Trending Tab */}
          <TabsContent value="trending" className="mt-8">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <p className="text-slate-400">Trending playlists will appear here</p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Playlist Detail Modal */}
        {selectedPlaylist && playlistDetail && (
          <Dialog open={!!selectedPlaylist} onOpenChange={(open) => !open && setSelectedPlaylist(null)}>
            <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Playlist Cover */}
                {selectedPlaylist.coverImageUrl && (
                  <div className="w-full aspect-square bg-slate-900 rounded-lg overflow-hidden">
                    <img
                      src={selectedPlaylist.coverImageUrl}
                      alt={selectedPlaylist.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Info */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedPlaylist.title}</h2>
                      {selectedPlaylist.creator && (
                        <p className="text-sm text-slate-400">
                          by {selectedPlaylist.creator.displayName}
                        </p>
                      )}
                    </div>
                    {selectedPlaylist.status === "published" && (
                      <Badge className="bg-green-600">Published</Badge>
                    )}
                  </div>
                  <p className="text-slate-400">{selectedPlaylist.description}</p>

                  {/* Stats */}
                  <div className="flex gap-4 mt-4 text-sm text-slate-500">
                    <span>{selectedPlaylist.itemCount || 0} clips</span>
                    <span>{selectedPlaylist.followerCount || 0} followers</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 border-t border-slate-700 pt-4">
                  <Button
                    variant={playlistDetail.isFollowing ? "secondary" : "default"}
                    className="flex-1 gap-2"
                    onClick={() => followMutation.mutate(selectedPlaylist.id)}
                  >
                    <Heart className="w-4 h-4" />
                    {playlistDetail.isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>

                {/* Clips */}
                <div className="space-y-3 border-t border-slate-700 pt-4">
                  <h3 className="font-semibold">Clips ({playlistDetail.clips?.length || 0})</h3>
                  {playlistDetail.clips?.length ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {playlistDetail.clips.map((clip, idx) => (
                        <div
                          key={clip.id}
                          className="p-3 bg-slate-700 rounded flex items-center gap-3 group hover:bg-slate-600 transition-colors"
                        >
                          <span className="text-slate-500 text-sm">{idx + 1}</span>
                          <Play className="w-4 h-4 text-slate-500" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{clip.title}</p>
                            <p className="text-xs text-slate-400">
                              {clip.duration ? `${Math.round(clip.duration)}s` : ""}
                            </p>
                          </div>
                          <GripVertical className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No clips in this playlist yet</p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function PlaylistCard({
  playlist,
  onSelect,
  onFollow,
  isOwner,
}: {
  playlist: Playlist;
  onSelect: (p: Playlist) => void;
  onFollow?: (id: string) => void;
  isOwner?: boolean;
}) {
  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-colors cursor-pointer">
      <div className="relative aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20">
        {playlist.coverImageUrl ? (
          <img
            src={playlist.coverImageUrl}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-12 h-12 text-slate-600" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-white mb-2">{playlist.title}</h3>
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{playlist.description}</p>

        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span>{playlist.itemCount || 0} clips</span>
          <span>{playlist.followerCount || 0} followers</span>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onSelect(playlist)}
          >
            View
          </Button>
          {onFollow && !isOwner && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onFollow(playlist.id)}
            >
              <Heart className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
