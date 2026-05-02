/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@shared/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Sparkles, TrendingUp, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReactPlayer from "react-player";

interface Highlight {
  id: string;
  sessionId: number;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  duration?: number | null;
  score?: string | null;
  status: string;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function Highlights() {
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [activeTab, setActiveTab] = useState("weekly");

  // Fetch weekly highlights
  const { data: weeklyHighlights, isLoading: weeklyLoading } = useQuery({
    queryKey: ["highlights.weekly"],
    queryFn: () => trpc.content.highlights.weekly.query(),
  });

  // Fetch monthly highlights
  const { data: monthlyHighlights, isLoading: monthlyLoading } = useQuery({
    queryKey: ["highlights.monthly"],
    queryFn: () => trpc.content.highlights.monthly.query(),
  });

  // Fetch selected highlight details
  const { data: highlightDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["highlights.byId", selectedHighlight?.id],
    queryFn: () =>
      selectedHighlight ? trpc.content.highlights.byId.query({ id: selectedHighlight.id }) : null,
    enabled: !!selectedHighlight,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-amber-500" />
            <h1 className="text-4xl font-bold">Best Moments</h1>
          </div>
          <p className="text-slate-400">
            Auto-generated highlights from your streams powered by engagement metrics
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="weekly" className="gap-2">
              <Calendar className="w-4 h-4" />
              This Week
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-2">
              <Calendar className="w-4 h-4" />
              This Month
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          {/* Weekly Highlights */}
          <TabsContent value="weekly" className="mt-8 space-y-6">
            {weeklyLoading ? (
              <div className="text-center py-12">Loading highlights...</div>
            ) : weeklyHighlights?.length ? (
              <>
                {weeklyHighlights.map((highlight) => (
                  <HighlightCard
                    key={highlight.id}
                    highlight={highlight}
                    onSelect={setSelectedHighlight}
                  />
                ))}
              </>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center text-slate-400">
                  <p>No highlights generated this week</p>
                  <p className="text-sm mt-2">Check back after your next stream!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Monthly Highlights */}
          <TabsContent value="monthly" className="mt-8 space-y-6">
            {monthlyLoading ? (
              <div className="text-center py-12">Loading highlights...</div>
            ) : monthlyHighlights?.length ? (
              <>
                {monthlyHighlights.map((highlight) => (
                  <HighlightCard
                    key={highlight.id}
                    highlight={highlight}
                    onSelect={setSelectedHighlight}
                  />
                ))}
              </>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center text-slate-400">
                  <p>No highlights available this month</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trending */}
          <TabsContent value="trending" className="mt-8">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <p className="text-slate-400">
                Trending highlights will be ranked by views, engagement, and shares
              </p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Highlight Detail Modal */}
        {selectedHighlight && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div
              className="bg-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                {/* Close button */}
                <button
                  onClick={() => setSelectedHighlight(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                  ✕
                </button>

                {/* Video Player */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  {selectedHighlight.videoUrl ? (
                    <ReactPlayer
                      url={selectedHighlight.videoUrl}
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

                {/* Highlight Info */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-2xl font-bold">{selectedHighlight.title}</h2>
                    <Badge className="bg-amber-600">
                      {selectedHighlight.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-slate-400 mb-4">{selectedHighlight.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-500">
                        {selectedHighlight.duration
                          ? `${Math.round(selectedHighlight.duration / 60)}m`
                          : "—"}
                      </p>
                      <p className="text-sm text-slate-400">Duration</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-500">
                        {selectedHighlight.score ? Math.round(Number(selectedHighlight.score)) : "—"}
                      </p>
                      <p className="text-sm text-slate-400">Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">0</p>
                      <p className="text-sm text-slate-400">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-pink-500">0</p>
                      <p className="text-sm text-slate-400">Shares</p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="text-sm text-slate-500">
                    <p>
                      Generated{" "}
                      {selectedHighlight.createdAt &&
                        formatDistanceToNow(new Date(selectedHighlight.createdAt), {
                          addSuffix: true,
                        })}
                    </p>
                    {selectedHighlight.publishedAt && (
                      <p>
                        Published{" "}
                        {formatDistanceToNow(new Date(selectedHighlight.publishedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Moments */}
                {highlightDetail?.moments && highlightDetail.moments.length > 0 && (
                  <div className="space-y-3 border-t border-slate-700 pt-4">
                    <h3 className="font-semibold">Key Moments</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {highlightDetail.moments.map((moment, idx) => (
                        <div key={idx} className="p-3 bg-slate-700 rounded text-sm">
                          <p className="font-medium">
                            {moment.type} • {moment.startTime}s - {moment.endTime}s
                          </p>
                          <p className="text-slate-300">Score: {Math.round(Number(moment.score))}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button className="flex-1">Share</Button>
                  <Button variant="outline" className="flex-1">
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HighlightCard({
  highlight,
  onSelect,
}: {
  highlight: Highlight;
  onSelect: (h: Highlight) => void;
}) {
  return (
    <Card
      className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-colors cursor-pointer"
      onClick={() => onSelect(highlight)}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-slate-900 rounded group md:col-span-1">
          {highlight.thumbnailUrl ? (
            <img
              src={highlight.thumbnailUrl}
              alt={highlight.title}
              className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-8 h-8 text-slate-600" />
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(highlight);
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors rounded"
          >
            <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <Badge className="absolute top-2 right-2 bg-amber-600/80">
            {highlight.status === "published" ? "Published" : "Draft"}
          </Badge>
        </div>

        {/* Content */}
        <div className="md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white text-lg">{highlight.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2">{highlight.description}</p>
              </div>
            </div>
          </div>

          {/* Stats and metadata */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
            <div className="flex gap-6 text-xs text-slate-500">
              {highlight.duration && (
                <span>{Math.round(highlight.duration / 60)}m duration</span>
              )}
              {highlight.score && (
                <span>Score: {Math.round(Number(highlight.score))}</span>
              )}
            </div>
            <span className="text-xs text-slate-500">
              {highlightAgeText(highlight.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function highlightAgeText(createdAt: Date | string): string {
  const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  return formatDistanceToNow(date, { addSuffix: true });
}
