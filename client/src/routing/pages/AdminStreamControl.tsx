import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Radio,
  Play,
  Square,
  Settings,
  AlertCircle,
  CheckCircle,
  Zap,
  Video,
  Eye,
  Users,
  Heart,
  TrendingUp,
  Gauge,
} from "lucide-react";

export default function AdminStreamControl() {
  const { user, isAuthenticated } = useAuth();
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [newStreamDialogOpen, setNewStreamDialogOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamDescription, setStreamDescription] = useState("");
  const [streamQuality, setStreamQuality] = useState("720p");

  const utils = trpc.useUtils();

  // Get live sessions (placeholder - would be from live router)
  const sessions = undefined;
  const sessionsLoading = false;

  // Placeholder viewer count
  const viewerCount = { count: 1250 };

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

  // Health status indicators
  const getHealthStatus = (metrics: any) => {
    if (!metrics) return "unknown";

    const viewerCount = metrics.viewerCount || 0;
    const messageCount = metrics.messageCount || 0;

    if (viewerCount > 1000 || messageCount > 100) {
      return "healthy";
    } else if (viewerCount > 100 || messageCount > 20) {
      return "active";
    } else if (viewerCount > 0 || messageCount > 0) {
      return "low";
    }
    return "offline";
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-600";
      case "active":
        return "bg-blue-600";
      case "low":
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Radio className="w-8 h-8 text-red-500" />
              <h1 className="text-4xl font-bold">Stream Control</h1>
            </div>
            <p className="text-muted-foreground">
              Manage live streams, monitor viewers, and control stream quality
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button onClick={() => setNewStreamDialogOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4" />
              Start New Stream
            </Button>
          </div>

          {/* Session Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Live Stream</CardTitle>
              <CardDescription>Choose a stream to monitor and control</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedSession?.toString() || ""} onValueChange={(val) => setSelectedSession(parseInt(val))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a stream..." />
                </SelectTrigger>
                <SelectContent>
                  {sessions?.map((session: any) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.title}
                      {session.isLive ? " (LIVE)" : " (Offline)"} -{" "}
                      {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedSession && (
            <>
              {/* Stream Status Overview */}
              <Card className="border-2 border-red-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Stream Status</CardTitle>
                    <Badge variant="outline" className="gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      LIVE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Viewers</span>
                      </div>
                      <p className="text-3xl font-bold">{viewerCount?.count || 0}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">Bitrate</span>
                      </div>
                      <p className="text-3xl font-bold">{streamQuality}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">FPS</span>
                      </div>
                      <p className="text-3xl font-bold">60</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">Uptime</span>
                      </div>
                      <p className="text-3xl font-bold">2h 34m</p>
                    </div>
                  </div>

                  {/* Health Indicators */}
                  <div className="space-y-3">
                    <p className="font-medium">Health Indicators</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Connection OK</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Audio Good</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Video Good</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">CPU 65%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stream Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Stream Controls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Quality Selection */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Video Quality</label>
                      <Select value={streamQuality} onValueChange={setStreamQuality}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="360p">360p (Low Bandwidth)</SelectItem>
                          <SelectItem value="480p">480p (Standard)</SelectItem>
                          <SelectItem value="720p">720p (HD)</SelectItem>
                          <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                          <SelectItem value="1440p">1440p (2K)</SelectItem>
                          <SelectItem value="2160p">2160p (4K)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-2">
                        Higher quality requires more bandwidth. Current viewers: {viewerCount?.count || 0}
                      </p>
                    </div>

                    {/* Bitrate */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Bitrate (kbps)</label>
                      <Input type="number" placeholder="6000" defaultValue="6000" />
                    </div>

                    {/* Audio Levels */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Audio Level</label>
                      <div className="flex items-center gap-4">
                        <input type="range" min="0" max="100" defaultValue="80" className="flex-1" />
                        <span className="text-sm font-medium">80%</span>
                      </div>
                    </div>

                    {/* Stream Controls */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button className="gap-2 flex-1 bg-red-600 hover:bg-red-700">
                        <Square className="w-4 h-4" />
                        Stop Stream
                      </Button>
                      <Button variant="outline" className="gap-2 flex-1">
                        <Video className="w-4 h-4" />
                        Pause Stream
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Encoder Settings</label>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Encoder</span>
                          <span className="font-medium">H.264 (NVIDIA)</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Profile</span>
                          <span className="font-medium">Main</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Preset</span>
                          <span className="font-medium">Medium</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Keyframe Interval</span>
                          <span className="font-medium">2 seconds</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Network Info</label>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>RTMP Server</span>
                          <span className="font-medium">rtmp.hectic-radio.live</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Stream Key</span>
                          <span className="font-medium text-xs">••••••••••••••••</span>
                        </div>
                        <div className="flex justify-between p-2 bg-muted rounded">
                          <span>Connection Status</span>
                          <span className="font-medium text-green-500">Connected</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Recording</label>
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1">
                          Start Recording
                        </Button>
                        <Button variant="secondary" className="flex-1">
                          Recording Status
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stream Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Stream Started</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Peak Viewers: 1,250</p>
                        <p className="text-xs text-muted-foreground">45 minutes ago</p>
                      </div>
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Quality Adjusted</p>
                        <p className="text-xs text-muted-foreground">15 minutes ago</p>
                      </div>
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* New Stream Dialog */}
      <Dialog open={newStreamDialogOpen} onOpenChange={setNewStreamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Stream</DialogTitle>
            <DialogDescription>Create a new live streaming session</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Stream Title</label>
              <Input
                placeholder="e.g., Friday Night Vibes"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                placeholder="e.g., Tonight's DJ mix featuring house music"
                value={streamDescription}
                onChange={(e) => setStreamDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Starting Quality</label>
              <Select value={streamQuality} onValueChange={setStreamQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p (HD)</SelectItem>
                  <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  <SelectItem value="480p">480p (Standard)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewStreamDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="gap-2 bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4" />
              Start Stream
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
