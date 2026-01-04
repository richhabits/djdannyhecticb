import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Play, ExternalLink, Calendar } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const releaseTypes = ["All", "Singles", "EPs", "Albums", "Remixes", "Collaborations"];

const sampleReleases = [
  {
    id: 1,
    title: "Hectic Beats Vol. 1",
    type: "EP",
    releaseDate: "2023-06-15",
    label: "Hectic Records",
    tracks: [
      { title: "Midnight Garage", artist: "DJ Danny Hectic B", duration: "4:32" },
      { title: "London Nights", artist: "DJ Danny Hectic B", duration: "5:15" },
      { title: "Underground Vibes", artist: "DJ Danny Hectic B", duration: "3:48" },
      { title: "Hectic Energy", artist: "DJ Danny Hectic B", duration: "4:20" },
    ],
    coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2670",
    streamingLinks: {
      spotify: "https://open.spotify.com/album/example",
      apple: "https://music.apple.com/album/example",
      soundcloud: "https://soundcloud.com/example",
    },
  },
  {
    id: 2,
    title: "Summer Sessions",
    type: "Album",
    releaseDate: "2023-08-20",
    label: "Hectic Records",
    tracks: [
      { title: "Summer Intro", artist: "DJ Danny Hectic B", duration: "1:15" },
      { title: "Beach Vibes", artist: "DJ Danny Hectic B", duration: "4:50" },
      { title: "Sunset Mix", artist: "DJ Danny Hectic B", duration: "5:30" },
      { title: "Night Drive", artist: "DJ Danny Hectic B", duration: "4:12" },
      { title: "Weekend Energy", artist: "DJ Danny Hectic B", duration: "3:55" },
      { title: "Summer Outro", artist: "DJ Danny Hectic B", duration: "1:30" },
    ],
    coverArt: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670",
    streamingLinks: {
      spotify: "https://open.spotify.com/album/example",
      apple: "https://music.apple.com/album/example",
    },
  },
  {
    id: 3,
    title: "Garage Nation Anthem",
    type: "Single",
    releaseDate: "2024-01-10",
    label: "Hectic Records",
    tracks: [
      { title: "Garage Nation Anthem", artist: "DJ Danny Hectic B", duration: "5:45" },
      { title: "Garage Nation Anthem (Instrumental)", artist: "DJ Danny Hectic B", duration: "5:45" },
    ],
    coverArt: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2670",
    streamingLinks: {
      spotify: "https://open.spotify.com/track/example",
      soundcloud: "https://soundcloud.com/example",
    },
  },
];

export default function Discography() {
  const [activeType, setActiveType] = useState("All");
  const [expandedRelease, setExpandedRelease] = useState<number | null>(null);

  const filteredReleases = activeType === "All"
    ? sampleReleases
    : sampleReleases.filter(r => r.type === activeType || (activeType === "Singles" && r.type === "Single"));

  return (
    <>
      <MetaTagsComponent
        title="Discography | DJ Danny Hectic B"
        description="Complete discography of releases, singles, EPs, and albums from DJ Danny Hectic B."
        url="/discography"
      />
      <div className="min-h-screen bg-background text-foreground pt-14">
        {/* Hero Section */}
        <section className="border-b border-foreground px-4 py-12 md:py-20">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">
              Discography
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete collection of releases, singles, EPs, albums, and collaborations.
            </p>
          </div>
        </section>

        {/* Type Filter */}
        <section className="sticky top-14 z-40 bg-background border-b border-foreground px-4 py-4">
          <div className="container max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {releaseTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={cn(
                    "px-4 py-2 uppercase font-bold text-sm tracking-wider transition-colors",
                    activeType === type
                      ? "bg-foreground text-background"
                      : "bg-transparent border border-foreground hover:bg-foreground hover:text-background"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Releases Grid */}
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReleases.map((release) => (
                <Card
                  key={release.id}
                  className="group overflow-hidden hover:scale-[1.02] transition-transform"
                >
                  <div className="relative aspect-square bg-black">
                    <img
                      src={release.coverArt}
                      alt={release.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Music className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-xl">{release.title}</CardTitle>
                      <span className="text-xs font-bold uppercase bg-accent text-background px-2 py-1">
                        {release.type}
                      </span>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(release.releaseDate).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                    <CardDescription>{release.label}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setExpandedRelease(expandedRelease === release.id ? null : release.id)}
                      >
                        {expandedRelease === release.id ? "Hide" : "View"} Tracklist
                      </Button>
                      {expandedRelease === release.id && (
                        <div className="space-y-2 pt-2 border-t">
                          {release.tracks.map((track, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground w-6">{idx + 1}.</span>
                                <div>
                                  <div className="font-medium">{track.title}</div>
                                  <div className="text-xs text-muted-foreground">{track.artist}</div>
                                </div>
                              </div>
                              <span className="text-muted-foreground">{track.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {Object.entries(release.streamingLinks).map(([platform, url]) => (
                          <Button
                            key={platform}
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(url, "_blank")}
                            className="text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {platform}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Streaming Links Section */}
        <section className="py-12 md:py-20 px-4 border-t border-foreground bg-muted/10">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-6">
              Stream Everywhere
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Find all releases on your favorite streaming platform.
            </p>
            <Link href="/mixes">
              <Button size="lg">
                <Play className="w-4 h-4 mr-2" />
                Browse All Mixes
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

