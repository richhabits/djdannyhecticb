import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Volume2, Video, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminAIStudio() {
  const { user, isAuthenticated } = useAuth();

  const { data: scriptJobs } = trpc.aiStudio.scripts.list.useQuery({ limit: 10 });
  const { data: voiceJobs } = trpc.aiStudio.voice.list.useQuery({ limit: 10 });
  const { data: videoJobs } = trpc.aiStudio.video.list.useQuery({ limit: 10 });
  const { data: consentStats } = trpc.aiStudio.consents.stats.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });
  const { data: studioStatus } = trpc.aiStudio.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: metrics } = trpc.aiStudio.metrics.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const previousStatus = useRef<typeof studioStatus>();

  useEffect(() => {
    if (!studioStatus) return;
    if (previousStatus.current) {
      if (previousStatus.current.aiStudioEnabled !== studioStatus.aiStudioEnabled) {
        toast[studioStatus.aiStudioEnabled ? "success" : "warning"](
          studioStatus.aiStudioEnabled ? "AI Studio enabled" : "AI Studio paused"
        );
      }
      if (previousStatus.current.fanFacingEnabled !== studioStatus.fanFacingEnabled) {
        toast.info(
          studioStatus.fanFacingEnabled
            ? "Fan-facing AI tools opened"
            : "Fan-facing AI tools closed"
        );
      }
    }
    previousStatus.current = studioStatus;
  }, [studioStatus]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Access denied. Admin only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));

  const todayScripts = scriptJobs?.filter((j) => new Date(j.createdAt) >= todayStart).length || 0;
  const todayVoice = voiceJobs?.filter((j) => new Date(j.createdAt) >= todayStart).length || 0;
  const todayVideo = videoJobs?.filter((j) => new Date(j.createdAt) >= todayStart).length || 0;
  const errors24h = [
    ...(scriptJobs?.filter((j) => j.status === "failed") || []),
    ...(voiceJobs?.filter((j) => j.status === "failed") || []),
    ...(videoJobs?.filter((j) => j.status === "failed") || []),
  ].filter((j) => new Date(j.createdAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length;

  const queueStats = metrics?.queue ?? { scripts: 0, voice: 0, video: 0 };
  const completedStats = metrics?.completed24h ?? { scripts: 0, voice: 0, video: 0 };
  const automation = metrics?.automation ?? { workerEnabled: false, intervalMs: 0 };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">AI Studio</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Control Room</Badge>
          <Badge variant={studioStatus?.aiStudioEnabled !== false ? "default" : "destructive"}>
            AI Studio {studioStatus?.aiStudioEnabled === false ? "Disabled" : "Enabled"}
          </Badge>
          <Badge variant={studioStatus?.fanFacingEnabled ? "default" : "secondary"}>
            Fan Tools {studioStatus?.fanFacingEnabled ? "On" : "Off"}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Scripts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayScripts}</div>
            <p className="text-xs text-muted-foreground">Script jobs created today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Voice</CardTitle>
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayVoice}</div>
            <p className="text-xs text-muted-foreground">Voice jobs created today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Video</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayVideo}</div>
            <p className="text-xs text-muted-foreground">Video jobs created today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors (24h)</CardTitle>
            {errors24h > 0 ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errors24h}</div>
            <p className="text-xs text-muted-foreground">Failed jobs in last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consent Opt-ins</CardTitle>
            <Badge variant="outline" className="text-[0.65rem] px-2">
              Live
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consentStats?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              AI: {consentStats?.aiContent ?? 0} · Marketing: {consentStats?.marketing ?? 0} · Data: {consentStats?.dataShare ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Depth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">Jobs waiting for automation</p>
            <div className="flex justify-between text-sm">
              <div>
                <p className="font-medium">Scripts</p>
                <p className="text-2xl font-bold">{queueStats.scripts}</p>
              </div>
              <div>
                <p className="font-medium">Voice</p>
                <p className="text-2xl font-bold">{queueStats.voice}</p>
              </div>
              <div>
                <p className="font-medium">Video</p>
                <p className="text-2xl font-bold">{queueStats.video}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Output</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">Completed via automation/manual</p>
            <div className="flex justify-between text-sm">
              <div>
                <p className="font-medium">Scripts</p>
                <p className="text-2xl font-bold">{completedStats.scripts}</p>
              </div>
              <div>
                <p className="font-medium">Voice</p>
                <p className="text-2xl font-bold">{completedStats.voice}</p>
              </div>
              <div>
                <p className="font-medium">Video</p>
                <p className="text-2xl font-bold">{completedStats.video}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Worker</span>
              <Badge variant={automation.workerEnabled ? "default" : "secondary"}>
                {automation.workerEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Interval</span>
              <span className="font-semibold">
                {(automation.intervalMs / 1000).toFixed(1)}s
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Background worker auto-processes queues when kill switches allow.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="scripts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>

        <TabsContent value="scripts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Script Jobs</h2>
            <Link href="/admin/ai-scripts">
              <Button variant="outline">View All Scripts</Button>
            </Link>
          </div>
          {scriptJobs && scriptJobs.length > 0 ? (
            <div className="space-y-2">
              {scriptJobs.slice(0, 5).map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{job.type}</Badge>
                          <Badge
                            variant={
                              job.status === "completed"
                                ? "default"
                                : job.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(job.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <Link href={`/admin/ai-scripts?job=${job.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No script jobs yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Voice Jobs</h2>
            <Link href="/admin/ai-voice">
              <Button variant="outline">View All Voice</Button>
            </Link>
          </div>
          {voiceJobs && voiceJobs.length > 0 ? (
            <div className="space-y-2">
              {voiceJobs.slice(0, 5).map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{job.voiceProfile}</Badge>
                          <Badge
                            variant={
                              job.status === "completed"
                                ? "default"
                                : job.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(job.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <Link href={`/admin/ai-voice?job=${job.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No voice jobs yet
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Video Jobs</h2>
            <Link href="/admin/ai-video">
              <Button variant="outline">View All Video</Button>
            </Link>
          </div>
          {videoJobs && videoJobs.length > 0 ? (
            <div className="space-y-2">
              {videoJobs.slice(0, 5).map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{job.stylePreset}</Badge>
                          <Badge
                            variant={
                              job.status === "completed"
                                ? "default"
                                : job.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(job.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <Link href={`/admin/ai-video?job=${job.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No video jobs yet
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

