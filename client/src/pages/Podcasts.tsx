/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Disc3,
  Download,
  Share2,
  Music,
  Apple,
  Volume2,
  Headphones,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PodcastEpisode {
  id: string;
  sessionId: number;
  title: string;
  description?: string | null;
  audioUrl?: string | null;
  transcript?: string | null;
  duration?: number | null;
  episodeNumber?: number | null;
  status: string;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  stats?: {
    downloads: number;
    plays: number;
    completionRate?: number | null;
    reviews: number;
    rating?: number | null;
  };
}

export default function Podcasts() {
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null);
  const [activeTab, setActiveTab] = useState("episodes");

  // Fetch latest episodes
  const { data: episodes, isLoading: episodesLoading } = useQuery({
    queryKey: ["podcast.latest"],
    queryFn: () => trpc.content.podcast.latest.query({ limit: 20 }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Headphones className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl font-bold">Podcast</h1>
          </div>
          <p className="text-slate-400">
            Listen to streaming highlights, extended cuts, and exclusive podcast episodes
          </p>
        </div>

        {/* Subscribe Buttons */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="gap-2 h-12 border-purple-600 text-purple-400 hover:bg-purple-600/10"
          >
            <Music className="w-4 h-4" />
            Subscribe on Spotify
          </Button>
          <Button
            variant="outline"
            className="gap-2 h-12 border-purple-600 text-purple-400 hover:bg-purple-600/10"
          >
            <Apple className="w-4 h-4" />
            Subscribe on Apple
          </Button>
          <Button
            variant="outline"
            className="gap-2 h-12 border-slate-600"
          >
            <Volume2 className="w-4 h-4" />
            RSS Feed
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>

          {/* Episodes Tab */}
          <TabsContent value="episodes" className="mt-8">
            <div className="space-y-4">
              {episodesLoading ? (
                <div className="text-center py-12">Loading episodes...</div>
              ) : episodes?.length ? (
                episodes.map((episode, index) => (
                  <EpisodeCard
                    key={episode.id}
                    episode={episode}
                    episodeNumber={episodes.length - index}
                    onSelect={setSelectedEpisode}
                    isSelected={selectedEpisode?.id === episode.id}
                  />
                ))
              ) : (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-12 text-center text-slate-400">
                    <p>No episodes available yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="mt-8">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <p className="text-slate-400">
                Most listened episodes will appear here
              </p>
            </Card>
          </TabsContent>

          {/* Archive Tab */}
          <TabsContent value="archive" className="mt-8">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <p className="text-slate-400">
                Archived episodes available for download
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EpisodeCard({
  episode,
  episodeNumber,
  onSelect,
  isSelected,
}: {
  episode: PodcastEpisode;
  episodeNumber: number;
  onSelect: (e: PodcastEpisode) => void;
  isSelected: boolean;
}) {
  return (
    <Card
      className={`bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-colors cursor-pointer ${
        isSelected ? "ring-2 ring-purple-600" : ""
      }`}
      onClick={() => onSelect(episode)}
    >
      <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Album Art */}
        <div className="relative aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded group md:col-span-1 flex items-center justify-center">
          <Disc3 className="w-12 h-12 text-white opacity-60" />
        </div>

        {/* Content */}
        <div className="md:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-2 mb-2">
              <Badge className="bg-purple-600/80">EP {episodeNumber}</Badge>
              {episode.status === "published" && (
                <Badge variant="outline">Published</Badge>
              )}
            </div>
            <h3 className="font-semibold text-white text-lg mb-1">{episode.title}</h3>
            <p className="text-sm text-slate-400 line-clamp-2">{episode.description}</p>
          </div>

          {/* Stats and metadata */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700 mt-3">
            <div className="flex gap-6 text-xs text-slate-500">
              {episode.stats && (
                <>
                  <span>{episode.stats.plays} plays</span>
                  <span>{episode.stats.downloads} downloads</span>
                </>
              )}
            </div>
            <span className="text-xs text-slate-500">
              {episode.publishedAt &&
                formatDistanceToNow(new Date(episode.publishedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
