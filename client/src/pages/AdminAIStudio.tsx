/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, Volume2, Video, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function AdminAIStudio() {
  const { user, isAuthenticated } = useAuth();

  const { data: scriptJobs } = trpc.aiStudio.scripts.list.useQuery({ limit: 10 });
  const { data: voiceJobs } = trpc.aiStudio.voice.list.useQuery({ limit: 10 });
  const { data: videoJobs } = trpc.aiStudio.video.list.useQuery({ limit: 10 });

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Studio</h1>
        <Badge variant="outline">Control Room</Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

