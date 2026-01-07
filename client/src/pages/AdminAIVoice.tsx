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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Volume2, Play, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function AdminAIVoice() {
  const { user, isAuthenticated } = useAuth();
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  const { data: jobs, refetch } = trpc.aiStudio.voice.list.useQuery({ limit: 100 });

  const { data: jobDetails } = trpc.aiStudio.voice.get.useQuery(
    { id: selectedJob || 0 },
    { enabled: !!selectedJob }
  );

  const processJob = trpc.aiStudio.voice.processOne.useMutation({
    onSuccess: () => {
      toast.success("Voice job processed");
      refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to process job";
      toast.error(message);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Voice Studio</h1>
        <Badge variant="outline">TTS Generation</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voice Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs && jobs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Voice Profile</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.voiceProfile}</Badge>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(job.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {job.status === "completed" && job.audioUrl && (
                          <audio controls className="h-8">
                            <source src={job.audioUrl} type="audio/mpeg" />
                          </audio>
                        )}
                        {job.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => processJob.mutate({ id: job.id })}
                            disabled={processJob.isPending}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {job.status === "failed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => processJob.mutate({ id: job.id })}
                            disabled={processJob.isPending}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedJob(job.id)}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No voice jobs found</p>
          )}
        </CardContent>
      </Card>

      {selectedJob && jobDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Text</p>
              <p className="text-sm text-muted-foreground">{jobDetails.rawText || "N/A"}</p>
            </div>
            {jobDetails.audioUrl && (
              <div>
                <p className="text-sm font-medium mb-2">Audio</p>
                <audio controls className="w-full">
                  <source src={jobDetails.audioUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}
            {jobDetails.errorMessage && (
              <div>
                <p className="text-sm font-medium text-red-500">Error</p>
                <p className="text-sm text-red-500">{jobDetails.errorMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

