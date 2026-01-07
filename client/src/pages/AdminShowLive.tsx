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

import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Radio, Play, Square, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function AdminShowLive() {
  const { user, isAuthenticated } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const { data: shows } = trpc.showsPhase9.adminList.useQuery();
  const { data: sessions } = trpc.live.adminListSessions.useQuery({ limit: 10 });
  const { data: currentLive } = trpc.live.getCurrentLive.useQuery();
  const { data: cues } = trpc.cues.adminListForSession.useQuery(
    { liveSessionId: selectedSessionId || 0 },
    { enabled: !!selectedSessionId }
  );

  const startSession = trpc.live.adminStart.useMutation({
    onSuccess: () => {
      toast.success("Live session started");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to start session";
      toast.error(message);
    },
  });

  const endSession = trpc.live.adminEnd.useMutation({
    onSuccess: () => {
      toast.success("Live session ended");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to end session";
      toast.error(message);
    },
  });

  const createCue = trpc.cues.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Cue created");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to create cue";
      toast.error(message);
    },
  });

  const updateCueStatus = trpc.cues.adminUpdateStatus.useMutation({
    onSuccess: () => {
      toast.success("Cue status updated");
    },
  });

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

  const activeSession = currentLive || sessions?.find((s) => s.status === "live");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Producer Control Room</h1>
        <Badge variant="outline">Live Show Control</Badge>
      </div>

      {/* Current Live Session */}
      {activeSession && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-red-500" />
                Live Session
              </CardTitle>
              <Badge variant="destructive">ON AIR</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="font-semibold">
                  {format(new Date(activeSession.startedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              {activeSession.liveUrl && (
                <div>
                  <Label>Live URL</Label>
                  <Input value={activeSession.liveUrl} readOnly />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (activeSession.id) {
                      endSession.mutate({ id: activeSession.id });
                      setSelectedSessionId(null);
                    }
                  }}
                  disabled={endSession.isPending}
                >
                  <Square className="h-4 w-4 mr-2" />
                  End Live
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cues List */}
      {activeSession && (
        <Card>
          <CardHeader>
            <CardTitle>Cues</CardTitle>
          </CardHeader>
          <CardContent>
            {cues && cues.length > 0 ? (
              <div className="space-y-2">
                {cues.map((cue) => (
                  <div
                    key={cue.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {cue.status === "done" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : cue.status === "skipped" ? (
                        <XCircle className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">{cue.type}</p>
                        {cue.payload && (
                          <p className="text-sm text-muted-foreground">{cue.payload}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCueStatus.mutate({ id: cue.id, status: "done" })}
                      >
                        Done
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateCueStatus.mutate({ id: cue.id, status: "skipped" })}
                      >
                        Skip
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No cues yet</p>
            )}
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                if (activeSession.id) {
                  createCue.mutate({
                    liveSessionId: activeSession.id,
                    type: "custom",
                    payload: "",
                    orderIndex: (cues?.length || 0) + 1,
                  });
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Cue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => setSelectedSessionId(session.id)}
                >
                  <div>
                    <p className="font-medium">
                      {format(new Date(session.startedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    <Badge variant={session.status === "live" ? "destructive" : "outline"}>
                      {session.status}
                    </Badge>
                  </div>
                  {session.status === "upcoming" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startSession.mutate({ id: session.id });
                        setSelectedSessionId(session.id);
                      }}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No sessions yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

