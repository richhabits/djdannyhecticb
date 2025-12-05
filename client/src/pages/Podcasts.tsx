import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Music, Play, Headphones, Music as SpotifyIcon } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { StreamingPlatformGrid } from "@/components/StreamingPlatformGrid";

export default function Podcasts() {
  const [playing, setPlaying] = useState<number | null>(null);
  const { data: podcasts, isLoading } = trpc.podcasts.list.useQuery();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Music className="w-6 h-6" />
            <span className="font-bold">DJ Danny Hectic B</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/mixes" className="text-sm hover:text-accent">Mixes</Link>
            <Link href="/events" className="text-sm hover:text-accent">Events</Link>
            <Link href="/live-studio" className="text-sm hover:text-accent">Live</Link>
            <Link href="/podcasts" className="text-sm font-medium text-accent">Podcast</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-purple-900/20 to-background border-b border-border">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Podcast</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Listen to DJ Danny Hectic B's podcast episodes on all major streaming platforms.
          </p>
        </div>
      </section>

      {/* Streaming Platforms */}
      <section className="py-8 border-b border-border bg-card/50">
        <div className="container space-y-3">
          <p className="text-sm text-muted-foreground">Listen on:</p>
          <StreamingPlatformGrid variant="buttons" />
        </div>
      </section>

      {/* Episodes */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">Latest Episodes</h2>
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : podcasts && podcasts.length > 0 ? (
            <div className="space-y-6">
              {podcasts.map((podcast) => (
                <Card key={podcast.id} className="p-6 hover:border-accent transition">
                  <div className="flex gap-6">
                    {/* Cover */}
                    <div className="flex-shrink-0">
                      {podcast.coverImageUrl ? (
                        <img
                          src={podcast.coverImageUrl}
                          alt={podcast.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Headphones className="w-8 h-8 text-white/50" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{podcast.title}</h3>
                        {podcast.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {podcast.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {podcast.episodeNumber && (
                            <span>Episode {podcast.episodeNumber}</span>
                          )}
                          {podcast.duration && (
                            <span>{Math.floor(podcast.duration / 60)}:{String(podcast.duration % 60).padStart(2, '0')}</span>
                          )}
                        </div>
                      </div>

                      {/* Player */}
                      {playing === podcast.id && (
                        <audio autoPlay controls className="w-full mt-4">
                          <source src={podcast.audioUrl} type="audio/mpeg" />
                        </audio>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant={playing === podcast.id ? "default" : "outline"}
                          onClick={() => setPlaying(playing === podcast.id ? null : podcast.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {playing === podcast.id ? 'Playing' : 'Play'}
                        </Button>
                        {podcast.spotifyUrl && (
                          <a href={podcast.spotifyUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <SpotifyIcon className="w-4 h-4 mr-2" />
                              Spotify
                            </Button>
                          </a>
                        )}
                        {podcast.applePodcastsUrl && (
                          <a href={podcast.applePodcastsUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <Music className="w-4 h-4 mr-2" />
                              Apple
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Headphones className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No podcast episodes yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-t border-border">
        <div className="container max-w-2xl text-center space-y-6">
          <h2 className="text-3xl font-bold">Subscribe to the Podcast</h2>
          <p className="text-lg text-muted-foreground">
            Get new episodes delivered to your favorite podcast app automatically.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <SpotifyIcon className="w-4 h-4 mr-2" />
                Spotify
              </Button>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <Music className="w-4 h-4 mr-2" />
                Apple Podcasts
              </Button>
            </a>
            <Button variant="outline">
              <Headphones className="w-4 h-4 mr-2" />
              Other Apps
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
