/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Youtube, ExternalLink } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";
import ReactPlayer from "react-player";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

const videoCategories = ["All", "Live Sets", "Mixes", "Interviews", "Behind the Scenes", "Festivals", "Clubs"];

export default function VideoGallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<any>(null); // Type 'any' for simplicity, or import Video type

  // Fetch real videos
  const { data: videos, isLoading } = trpc.videos.list.useQuery();

  const filteredVideos = (videos || []).filter((v: any) =>
    activeCategory === "All" || v.category === activeCategory
  );

  return (
    <>
      <MetaTagsComponent
        title="Video Gallery | DJ Danny Hectic B"
        description="Watch live sets, mixes, interviews, and behind-the-scenes content from DJ Danny Hectic B."
        url="/videos"
      />
      <div className="min-h-screen bg-background text-foreground pt-14">
        {/* Hero Section */}
        <section className="border-b border-foreground px-4 py-12 md:py-20">
          <div className="container max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">
              Video Gallery
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch live sets, exclusive mixes, interviews, and behind-the-scenes content.
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="sticky top-14 z-40 bg-background border-b border-foreground px-4 py-4">
          <div className="container max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {videoCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 uppercase font-bold text-sm tracking-wider transition-colors",
                    activeCategory === cat
                      ? "bg-foreground text-background"
                      : "bg-transparent border border-foreground hover:bg-foreground hover:text-background"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Video Grid */}
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            {isLoading ? (
              <div className="text-center py-12">Loading videos...</div>
            ) : filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video: any) => (
                  <Card
                    key={video.id}
                    className="group cursor-pointer overflow-hidden hover:scale-[1.02] transition-transform"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative aspect-video bg-black">
                      {/* Use external-provided thumbnail or fallback logic if needed */}
                      <img
                        src={video.thumbnailUrl || `https://img.youtube.com/vi/${(video.youtubeUrl.split('v=')[1] || '').split('&')[0]}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100" />
                      </div>
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-xs font-bold text-white">
                          {video.duration}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg line-clamp-2">{video.title}</h3>
                        <Youtube className="w-5 h-5 text-red-500 flex-shrink-0" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {video.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{video.views} views</span>
                        <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No videos found.</div>
            )}
          </div>
        </section>

        {/* Video Modal */}
        {selectedVideo && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="bg-background rounded-lg overflow-hidden">
                <div className="aspect-video bg-black">
                  <ReactPlayer
                    url={selectedVideo.youtubeUrl}
                    width="100%"
                    height="100%"
                    controls
                    playing
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                      <p className="text-muted-foreground">{selectedVideo.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedVideo.youtubeUrl, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Watch on YouTube
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{selectedVideo.views} views</span>
                    <span>•</span>
                    <span>{new Date(selectedVideo.publishedAt).toLocaleDateString()}</span>
                    {(selectedVideo.duration) && <span>• {selectedVideo.duration}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


