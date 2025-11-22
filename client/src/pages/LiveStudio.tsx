import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Radio, Users, Volume2, Eye, Youtube, Twitch, Instagram } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function LiveStudio() {
  const [isLive, setIsLive] = useState(true);
  const [viewers, setViewers] = useState(342);
  const [currentTrack, setCurrentTrack] = useState("Hectic Beats Mix Vol. 5");
  const [activeStream, setActiveStream] = useState<'youtube' | 'youtube-live' | 'twitch' | 'instagram' | 'tiktok'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeLiveUrl, setYoutubeLiveUrl] = useState('');
  const [twitchUrl, setTwitchUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 10) - 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getEmbedUrl = (url: string, platform: string) => {
    if (!url) return '';
    
    if (platform === 'youtube') {
      const videoId = url.includes('youtube.com') 
        ? url.split('v=')[1]?.split('&')[0]
        : url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    if (platform === 'twitch') {
      const channelName = url.split('twitch.tv/')[1]?.split('?')[0];
      return `https://player.twitch.tv/?channel=${channelName}&parent=${window.location.hostname}`;
    }
    
    return url;
  };

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
            <Link href="/live-studio" className="text-sm font-medium text-accent">Live</Link>
            <Link href="/podcasts" className="text-sm hover:text-accent">Podcast</Link>
          </nav>
        </div>
      </header>

      {/* Live Stream Section */}
      <section className="py-8 md:py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Stream */}
            <div className="lg:col-span-2">
              {/* Stream Platform Selector */}
              <div className="mb-6 flex flex-wrap gap-3">
                <Button
                  onClick={() => setActiveStream('youtube')}
                  variant={activeStream === 'youtube' ? 'default' : 'outline'}
                  className={activeStream === 'youtube' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <Youtube className="w-4 h-4 mr-2" />
                  YouTube Video
                </Button>
                <Button
                  onClick={() => setActiveStream('youtube-live')}
                  variant={activeStream === 'youtube-live' ? 'default' : 'outline'}
                  className={activeStream === 'youtube-live' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <Radio className="w-4 h-4 mr-2" />
                  YouTube Live
                </Button>
                <Button
                  onClick={() => setActiveStream('twitch')}
                  variant={activeStream === 'twitch' ? 'default' : 'outline'}
                  className={activeStream === 'twitch' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  <Twitch className="w-4 h-4 mr-2" />
                  Twitch
                </Button>
                <Button
                  onClick={() => setActiveStream('instagram')}
                  variant={activeStream === 'instagram' ? 'default' : 'outline'}
                  className={activeStream === 'instagram' ? 'bg-pink-600 hover:bg-pink-700' : ''}
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Button>
                <Button
                  onClick={() => setActiveStream('tiktok')}
                  variant={activeStream === 'tiktok' ? 'default' : 'outline'}
                  className={activeStream === 'tiktok' ? 'bg-black hover:bg-gray-900' : ''}
                >
                  <Music className="w-4 h-4 mr-2" />
                  TikTok Live
                </Button>
              </div>

              {/* Stream Input Form */}
              <Card className="p-6 mb-6 bg-card/50">
                <h3 className="text-lg font-semibold mb-4">Add Streaming URL</h3>
                <div className="space-y-4">
                  {activeStream === 'youtube' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">YouTube Video URL</label>
                      <input
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Paste your YouTube video URL</p>
                    </div>
                  )}
                  {activeStream === 'youtube-live' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">YouTube Live Stream URL</label>
                      <input
                        type="text"
                        value={youtubeLiveUrl}
                        onChange={(e) => setYoutubeLiveUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or your channel URL"
                        className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Paste your YouTube Live stream URL or channel URL</p>
                    </div>
                  )}
                  {activeStream === 'twitch' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Twitch Channel URL</label>
                      <input
                        type="text"
                        value={twitchUrl}
                        onChange={(e) => setTwitchUrl(e.target.value)}
                        placeholder="https://www.twitch.tv/yourchannelname"
                        className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Paste your Twitch channel URL</p>
                    </div>
                  )}
                  {activeStream === 'instagram' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Instagram Live URL</label>
                      <input
                        type="text"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://www.instagram.com/yourprofile"
                        className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Paste your Instagram profile URL</p>
                    </div>
                  )}
                  {activeStream === 'tiktok' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">TikTok Live URL</label>
                      <input
                        type="text"
                        value={tiktokUrl}
                        onChange={(e) => setTiktokUrl(e.target.value)}
                        placeholder="https://www.tiktok.com/@yourprofile"
                        className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Paste your TikTok profile URL for live streaming</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Stream Display */}
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-6 border border-border">
                {activeStream === 'youtube' && youtubeUrl ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={getEmbedUrl(youtubeUrl, 'youtube')}
                    title="YouTube Stream"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : activeStream === 'youtube-live' && youtubeLiveUrl ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={getEmbedUrl(youtubeLiveUrl, 'youtube')}
                    title="YouTube Live Stream"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : activeStream === 'twitch' && twitchUrl ? (
                  <iframe
                    src={getEmbedUrl(twitchUrl, 'twitch')}
                    height="100%"
                    width="100%"
                    title="Twitch Stream"
                    frameBorder="0"
                    allowFullScreen
                  />
                ) : activeStream === 'instagram' && instagramUrl ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-pink-900">
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-center">
                      <Instagram className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                      <p className="text-white font-semibold">Open Instagram Live</p>
                      <p className="text-gray-400 text-sm mt-2">Click to open in new window</p>
                    </a>
                  </div>
                ) : activeStream === 'tiktok' && tiktokUrl ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
                    <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-center">
                      <Music className="w-16 h-16 text-white mx-auto mb-4" />
                      <p className="text-white font-semibold">Open TikTok Live</p>
                      <p className="text-gray-400 text-sm mt-2">Click to open in new window</p>
                    </a>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center relative">
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
                      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
                    </div>

                    {/* Studio Content */}
                    <div className="relative z-10 text-center space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-red-500 font-semibold">LIVE NOW</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Studio Session</h2>
                        <p className="text-lg text-gray-300">DJ Danny Hectic B</p>
                      </div>

                      {/* Visualizer */}
                      <div className="flex items-end justify-center gap-1 h-24">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
                            style={{
                              height: `${Math.random() * 80 + 20}px`,
                              animation: `pulse ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                            }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center justify-center gap-4 text-white">
                        <div className="flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          <span>{viewers.toLocaleString()} watching</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-5 h-5" />
                          <span>High Quality</span>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm">Add a streaming URL above to display live stream</p>
                    </div>
                  </div>
                )}

                {/* Live Badge */}
                {(youtubeUrl || youtubeLiveUrl || twitchUrl || instagramUrl || tiktokUrl) && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/90 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-white font-semibold text-sm">LIVE</span>
                  </div>
                )}
              </div>

              {/* Now Playing */}
              <Card className="p-6 bg-card/50 backdrop-blur">
                <h3 className="text-lg font-semibold mb-4">Now Playing</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{currentTrack}</p>
                    <p className="text-sm text-muted-foreground">DJ Danny Hectic B</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Music className="w-4 h-4 mr-2" />
                    Add to Playlist
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stream Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Stream Info</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${youtubeUrl || twitchUrl || instagramUrl ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <span className="font-semibold">{youtubeUrl || twitchUrl || instagramUrl ? 'Live' : 'Offline'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Viewers</p>
                    <p className="text-2xl font-bold">{viewers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Platform</p>
                    <p className="font-semibold capitalize">{activeStream}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Quality</p>
                    <p className="font-semibold">1080p 60fps</p>
                  </div>
                </div>
              </Card>

              {/* Platform Guide */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Streaming Guide</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-red-400 mb-1">YouTube</p>
                    <p className="text-muted-foreground">Paste your YouTube video or live stream URL</p>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-400 mb-1">Twitch</p>
                    <p className="text-muted-foreground">Paste your Twitch channel URL</p>
                  </div>
                  <div>
                    <p className="font-semibold text-pink-400 mb-1">Instagram</p>
                    <p className="text-muted-foreground">Paste your Instagram profile URL</p>
                  </div>
                </div>
              </Card>

              {/* Chat */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Chat
                </h3>
                <div className="space-y-3 mb-4 h-48 overflow-y-auto">
                  <div className="text-sm">
                    <p className="font-semibold text-purple-400">@DJ_Fan</p>
                    <p className="text-muted-foreground">Amazing vibes! 🔥</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-pink-400">@MusicLover</p>
                    <p className="text-muted-foreground">Best session ever!</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-blue-400">@HeticBeats</p>
                    <p className="text-muted-foreground">Keep it going! 🎵</p>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Send a message..."
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </Card>

              {/* Schedule */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Next Session</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tomorrow</p>
                  <p className="font-semibold">8:00 PM - 10:00 PM</p>
                  <Button className="w-full mt-4" variant="outline">
                    <Radio className="w-4 h-4 mr-2" />
                    Remind Me
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 border-t border-border bg-card/50">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12">Multi-Platform Streaming</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
                <Youtube className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-semibold mb-2">YouTube Live</h3>
              <p className="text-sm text-muted-foreground">Stream directly from YouTube with full HD quality and chat integration.</p>
            </Card>
            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Twitch className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Twitch Streaming</h3>
              <p className="text-sm text-muted-foreground">Connect your Twitch channel for interactive live streaming with viewers.</p>
            </Card>
            <Card className="p-6">
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                <Instagram className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-semibold mb-2">Instagram Live</h3>
              <p className="text-sm text-muted-foreground">Go live on Instagram and reach your followers directly.</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
