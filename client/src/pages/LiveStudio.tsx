import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, Radio, Users, Volume2, Eye, Youtube, Twitch, Instagram, Shield, Mic2 } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function LiveStudio() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeTab, setActiveTab] = useState<'view' | 'admin'>('view');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Music className="w-6 h-6" />
            <span className="font-bold">DJ Danny Hectic B</span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/mixes" className="text-sm hover:text-accent">Mixes</Link>
              <Link href="/events" className="text-sm hover:text-accent">Events</Link>
              <Link href="/live-studio" className="text-sm font-medium text-accent">Live</Link>
            </nav>
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'view' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('view')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant={activeTab === 'admin' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('admin')}
                  className={activeTab === 'admin' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {activeTab === 'admin' ? <AdminMissionControl /> : <ViewerMode />}
    </div>
  );
}

function AdminMissionControl() {
  const [showName, setShowName] = useState("The Hectic Live Show");
  const [hostName, setHostName] = useState("DJ Danny Hectic B");
  const [activeMode, setActiveMode] = useState<'video' | 'radio'>('video');
  const [statsUrl, setStatsUrl] = useState("");
  const [serverType, setServerType] = useState<'icecast' | 'shoutcast'>('icecast');
  const [isGoingLive, setIsGoingLive] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");

  const { data: streams } = trpc.streams.list.useQuery();
  const [selectedStreamId, setSelectedStreamId] = useState<number | null>(null);

  // Auto-select first stream if available
  useEffect(() => {
    if (streams && streams.length > 0 && !selectedStreamId) {
      setSelectedStreamId(streams[0].id);
    }
  }, [streams, selectedStreamId]);

  const goLive = trpc.streams.goLive.useMutation({
    onSuccess: () => {
      toast.success("WE ARE LIVE! The site has been updated.");
      setIsGoingLive(false);
    },
    onError: (err) => {
      toast.error(`Failed to go live: ${err.message}`);
      setIsGoingLive(false);
    }
  });

  const handleGoLive = () => {
    if (activeMode === 'video' && !streamUrl) {
      toast.error("Please enter a valid video stream URL");
      return;
    }
    if (activeMode === 'radio' && !statsUrl) {
      toast.error("Please enter a valid Stats URL");
      return;
    }

    // Audit Fix: Use selected stream or fallback
    const targetStreamId = selectedStreamId || (streams?.[0]?.id) || 1;

    const c = confirm(`Are you sure you want to go live?\n\nShow: ${showName}\nHost: ${hostName}\nMode: ${activeMode.toUpperCase()}`);
    if (!c) return;

    setIsGoingLive(true);
    goLive.mutate({
      streamId: targetStreamId,
      showName,
      hostName,
      category: activeMode === 'radio' ? "Live Radio" : "Live Video",
      statsUrl: activeMode === 'radio' ? statsUrl : undefined,
      serverType: activeMode === 'radio' ? serverType : undefined,
    });
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-red-500" />
          Mission Control
        </h1>
        <p className="text-muted-foreground">Configure your stream and broadcast to the Hectic Universe.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          variant={activeMode === 'video' ? 'default' : 'outline'}
          onClick={() => setActiveMode('video')}
          className="w-1/2"
        >
          <Youtube className="w-4 h-4 mr-2" />
          Video Stream
        </Button>
        <Button
          variant={activeMode === 'radio' ? 'default' : 'outline'}
          onClick={() => setActiveMode('radio')}
          className="w-1/2"
        >
          <Radio className="w-4 h-4 mr-2" />
          Radio Server
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label>Show Name</Label>
            <Input
              value={showName}
              onChange={(e) => setShowName(e.target.value)}
              placeholder="e.g. Saturday Night Hype"
            />
          </div>

          <div className="space-y-2">
            <Label>Host / DJ</Label>
            <Input
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="e.g. DJ Danny Hectic B"
            />
          </div>

          {activeMode === 'video' ? (
            <div className="space-y-2">
              <Label>Stream URL (YouTube / Twitch / Mixcloud)</Label>
              <Input
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://youtube.com/live/..."
              />
              <p className="text-xs text-muted-foreground">Paste exact URL. This will be embedded for all users.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Server Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="serverType"
                      checked={serverType === 'icecast'}
                      onChange={() => setServerType('icecast')}
                    /> Icecast
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="serverType"
                      checked={serverType === 'shoutcast'}
                      onChange={() => setServerType('shoutcast')}
                    /> Shoutcast v2
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Stats URL (JSON)</Label>
                <Input
                  value={statsUrl}
                  onChange={(e) => setStatsUrl(e.target.value)}
                  placeholder={serverType === 'icecast' ? "http://server:port/status-json.xsl" : "http://server:port/stats?json=1"}
                />
                <p className="text-xs text-muted-foreground">
                  The URL where JSON stats can be fetched from.
                  <br />Example: <code>https://stream.example.com/status-json.xsl</code>
                </p>
              </div>
            </>
          )}

          <div className="pt-4">
            <Button
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xl py-8 shadow-lg shadow-red-900/20 active:scale-95 transition-all"
              onClick={handleGoLive}
              disabled={isGoingLive || goLive.isPending}
            >
              {isGoingLive || goLive.isPending ? "INITIALIZING..." : "GO LIVE NOW"}
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 bg-accent/5 border-accent/20">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Mic2 className="w-4 h-4" />
              Host Preview
            </h3>
            <div className="space-y-1">
              <p className="text-3xl font-black italic uppercase gradient-text">{showName}</p>
              <p className="text-xl text-white/80">with {hostName}</p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-green-400 bg-green-950/30 px-3 py-2 rounded-full w-fit">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Ready to broadcast
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Server Status</p>
                <p className="text-green-500 font-bold">Online</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registered Users</p>
                <p className="font-bold">1,240</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ViewerMode() {
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
    // ... existing viewer content ...
    <section className="py-8 md:py-12">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stream */}
          <div className="lg:col-span-2">
            {/* Stream Platform Selector & Inputs - Hidden for normal users if handling programmatically, but kept for manual demo */}
            <div className="mb-6 flex flex-wrap gap-3">
              {/* ... existing buttons ... */}
              <Button onClick={() => setActiveStream('youtube')} variant={activeStream === 'youtube' ? 'default' : 'outline'}><Youtube className="w-4 h-4 mr-2" />Video</Button>
              <Button onClick={() => setActiveStream('youtube-live')} variant={activeStream === 'youtube-live' ? 'default' : 'outline'}><Radio className="w-4 h-4 mr-2" />Live</Button>
              <Button onClick={() => setActiveStream('twitch')} variant={activeStream === 'twitch' ? 'default' : 'outline'}><Twitch className="w-4 h-4 mr-2" />Twitch</Button>
            </div>

            {/* Stream Input Form */}
            <Card className="p-6 mb-6 bg-card/50">
              {/* ... simplified inputs for demo ... */}
              <Input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="Paste Stream URL for Preview..." />
            </Card>

            {/* Stream Display */}
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-6 border border-border">
              {/* Visualizer Placeholder / Stream if Active */}
              <div className="w-full h-full bg-gradient-to-br from-orange-900 via-black to-amber-900 flex items-center justify-center relative">
                <div className="relative z-10 text-center space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-red-500 font-semibold">LIVE NOW</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white">Studio Session</h2>
                    <p className="text-lg text-gray-300">DJ Danny Hectic B</p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-white">
                    <span>{viewers.toLocaleString()} watching</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6"><h3 className="font-semibold">Chat</h3><p className="text-muted-foreground">Chat messages...</p></Card>
          </div>
        </div>
      </div>
    </section>
  );
}
