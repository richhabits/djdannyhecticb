/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Heart, MessageCircle, Share2, Eye, Plus, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import ReactPlayer from "react-player";

interface ClipWithMetadata {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  duration?: number | null;
  createdAt: Date;
  publishedAt?: Date | null;
  status: string;
  creator?: {
    id: number;
    name?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
  likesCount?: number;
  viewsCount?: number;
  commentsCount?: number;
}

export default function Clips() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClip, setSelectedClip] = useState<ClipWithMetadata | null>(null);
  const [activeTab, setActiveTab] = useState("trending");
  const [commentText, setCommentText] = useState("");

  // Fetch trending clips
  const { data: trendingClips, isLoading: trendingLoading } = useQuery({
    queryKey: ["clips.trending"],
    queryFn: () => trpc.content.clips.trending.query({ limit: 10, days: 7 }),
  });

  // Fetch user's clips if authenticated
  const { data: myClips, isLoading: myClipsLoading } = useQuery({
    queryKey: ["clips.myClips", user?.id],
    queryFn: () =>
      user ? trpc.content.clips.list.query({ userId: user.id, limit: 20 }) : null,
    enabled: !!user,
  });

  // Fetch clip details
  const { data: clipDetail, isLoading: clipLoading } = useQuery({
    queryKey: ["clips.byId", selectedClip?.id],
    queryFn: () =>
      selectedClip ? trpc.content.clips.byId.query({ id: selectedClip.id }) : null,
    enabled: !!selectedClip,
  });

  // Like clip mutation
  const likeMutation = useMutation({
    mutationFn: (clipId: string) => trpc.content.clips.toggleLike.mutate({ clipId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clips.byId"] });
    },
  });

  // View clip mutation
  const viewMutation = useMutation({
    mutationFn: (clipId: string) => trpc.content.clips.view.mutate({ clipId }),
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: (comment: string) =>
      selectedClip
        ? trpc.content.clips.addComment.mutate({
            clipId: selectedClip.id,
            comment,
          })
        : null,
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["clips.byId"] });
    },
  });

  // Get comments
  const { data: comments } = useQuery({
    queryKey: ["clips.comments", selectedClip?.id],
    queryFn: () =>
      selectedClip
        ? trpc.content.clips.getComments.query({ clipId: selectedClip.id, limit: 20 })
        : null,
    enabled: !!selectedClip,
  });

  const handleClipSelect = (clip: ClipWithMetadata) => {
    setSelectedClip(clip);
    viewMutation.mutate(clip.id);
  };

  const handleLike = (clipId: string) => {
    if (!user) return;
    likeMutation.mutate(clipId);
  };

  const handleComment = () => {
    if (!user || !commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Clip Library</h1>
          <p className="text-slate-400">
            Discover, create, and share your favorite streaming moments
          </p>
        </div>

        {/* Create Clip Button */}
        {user && (
          <div className="mb-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Clip
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle>Create New Clip</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Clip Title" className="bg-slate-700 border-slate-600" />
                  <Textarea
                    placeholder="Description (optional)"
                    className="bg-slate-700 border-slate-600"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Start Time (seconds)"
                      className="bg-slate-700 border-slate-600"
                    />
                    <Input
                      type="number"
                      placeholder="End Time (seconds)"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <Button className="w-full">Create Clip</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            {user && <TabsTrigger value="my-clips">My Clips</TabsTrigger>}
            <TabsTrigger value="popular">Most Watched</TabsTrigger>
          </TabsList>

          {/* Trending Clips Tab */}
          <TabsContent value="trending" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingLoading ? (
                <div className="col-span-full text-center py-12">Loading...</div>
              ) : trendingClips?.length ? (
                trendingClips.map((clip) => (
                  <ClipCard
                    key={clip.id}
                    clip={clip}
                    onSelect={handleClipSelect}
                    onLike={handleLike}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-400">
                  No clips available yet
                </div>
              )}
            </div>
          </TabsContent>

          {/* My Clips Tab */}
          {user && (
            <TabsContent value="my-clips" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myClipsLoading ? (
                  <div className="col-span-full text-center py-12">Loading...</div>
                ) : myClips?.length ? (
                  myClips.map((clip) => (
                    <ClipCard
                      key={clip.id}
                      clip={clip}
                      onSelect={handleClipSelect}
                      onLike={handleLike}
                      isOwner={clip.userId === user.id}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-slate-400">
                    You haven't created any clips yet
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Popular Tab */}
          <TabsContent value="popular" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingClips?.slice(0, 9).map((clip) => (
                <ClipCard
                  key={clip.id}
                  clip={clip}
                  onSelect={handleClipSelect}
                  onLike={handleLike}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Clip Detail Modal */}
        {selectedClip && (
          <Dialog open={!!selectedClip} onOpenChange={(open) => !open && setSelectedClip(null)}>
            <DialogContent className="max-w-3xl bg-slate-800 border-slate-700">
              <div className="space-y-6">
                {/* Video Player */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {selectedClip.videoUrl ? (
                    <ReactPlayer
                      url={selectedClip.videoUrl}
                      controls
                      width="100%"
                      height="100%"
                      playing
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-12 h-12 text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Clip Info */}
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedClip.title}</h2>
                  <p className="text-slate-400 mb-4">{selectedClip.description}</p>

                  {/* Stats */}
                  <div className="flex gap-6 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{clipDetail?.viewsCount || 0} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span>{clipDetail?.likesCount || 0} likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>{clipDetail?.commentsCount || 0} comments</span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 text-sm text-slate-500">
                    <p>
                      by {selectedClip.creator?.displayName || selectedClip.creator?.name}{" "}
                      {selectedClip.createdAt &&
                        `• ${formatDistanceToNow(new Date(selectedClip.createdAt), {
                          addSuffix: true,
                        })}`}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant={likeMutation.isPending ? "secondary" : "outline"}
                    className="gap-2"
                    onClick={() => selectedClip && handleLike(selectedClip.id)}
                    disabled={!user}
                  >
                    <Heart className="w-4 h-4" />
                    Like
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>

                {/* Comments Section */}
                <div className="space-y-4 border-t border-slate-700 pt-4">
                  <h3 className="font-semibold">Comments</h3>

                  {user && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="bg-slate-700 border-slate-600"
                      />
                      <Button
                        size="sm"
                        onClick={handleComment}
                        disabled={commentMutation.isPending || !commentText.trim()}
                      >
                        Post Comment
                      </Button>
                    </div>
                  )}

                  {comments && comments.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {comments.map((c) => (
                        <div
                          key={c.comment.id}
                          className="p-3 bg-slate-700 rounded text-sm space-y-1"
                        >
                          <p className="font-medium text-white">{c.author?.displayName}</p>
                          <p className="text-slate-300">{c.comment.comment}</p>
                          <p className="text-slate-500 text-xs">
                            {c.comment.createdAt &&
                              formatDistanceToNow(new Date(c.comment.createdAt), {
                                addSuffix: true,
                              })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No comments yet</p>
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

// Clip Card Component
function ClipCard({
  clip,
  onSelect,
  onLike,
  isOwner,
}: {
  clip: ClipWithMetadata;
  onSelect: (clip: ClipWithMetadata) => void;
  onLike: (clipId: string) => void;
  isOwner?: boolean;
}) {
  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-colors cursor-pointer">
      <div className="relative aspect-video bg-slate-900 group">
        {clip.thumbnailUrl ? (
          <img
            src={clip.thumbnailUrl}
            alt={clip.title}
            className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-12 h-12 text-slate-600 group-hover:text-slate-500" />
          </div>
        )}
        <button
          onClick={() => onSelect(clip)}
          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors"
        >
          <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        {isOwner && (
          <Badge className="absolute top-2 right-2 bg-purple-600">Your Clip</Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-white mb-2 line-clamp-2">{clip.title}</h3>
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{clip.description}</p>

        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span>{clip.creator?.displayName || "Unknown"}</span>
          <span>
            {clip.duration ? `${Math.round(clip.duration / 1000)}s` : ""}
          </span>
        </div>

        <div className="flex gap-4 text-slate-400">
          <button
            onClick={() => onLike(clip.id)}
            className="flex items-center gap-1 hover:text-red-500 transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span className="text-xs">{clip.likesCount || 0}</span>
          </button>
          <button
            onClick={() => onSelect(clip)}
            className="flex items-center gap-1 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{clip.commentsCount || 0}</span>
          </button>
          <button
            onClick={() => onSelect(clip)}
            className="flex items-center gap-1 hover:text-green-500 transition-colors ml-auto"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
