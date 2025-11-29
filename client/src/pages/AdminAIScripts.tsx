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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { FileText, Play, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminAIScripts() {
  const { user, isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  const { data: jobs, refetch } = trpc.aiStudio.scripts.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    limit: 100,
  });

  const { data: jobDetails } = trpc.aiStudio.scripts.get.useQuery(
    { id: selectedJob || 0 },
    { enabled: !!selectedJob }
  );

  const processJob = trpc.aiStudio.scripts.processOne.useMutation({
    onSuccess: () => {
      toast.success("Script job processed");
      refetch();
      if (selectedJob) {
        refetch();
      }
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
        <h1 className="text-3xl font-bold">AI Script Factory</h1>
        <Badge variant="outline">Admin Only</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="intro">Intro</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                  <SelectItem value="mixStory">Mix Story</SelectItem>
                  <SelectItem value="tiktokClip">TikTok Clip</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                  <SelectItem value="fanShout">Fan Shout</SelectItem>
                  <SelectItem value="generic">Generic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Script Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs && jobs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
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
                      <Badge variant="outline">{job.type}</Badge>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedJob(job.id)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No script jobs found</p>
          )}
        </CardContent>
      </Card>

      {/* Job Details Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Script Job Details</DialogTitle>
          </DialogHeader>
          {jobDetails && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Type</p>
                <Badge variant="outline">{jobDetails.type}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge
                  variant={
                    jobDetails.status === "completed"
                      ? "default"
                      : jobDetails.status === "failed"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {jobDetails.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Input Context</p>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(JSON.parse(jobDetails.inputContext || "{}"), null, 2)}
                </pre>
              </div>
              {jobDetails.resultText && (
                <div>
                  <p className="text-sm font-medium mb-2">Generated Script</p>
                  <div className="bg-muted p-3 rounded">
                    <p className="whitespace-pre-wrap">{jobDetails.resultText}</p>
                  </div>
                </div>
              )}
              {jobDetails.errorMessage && (
                <div>
                  <p className="text-sm font-medium mb-2 text-red-500">Error</p>
                  <p className="text-sm text-red-500">{jobDetails.errorMessage}</p>
                </div>
              )}
              {jobDetails.status === "pending" && (
                <Button
                  onClick={() => {
                    processJob.mutate({ id: jobDetails.id });
                  }}
                  disabled={processJob.isPending}
                  className="w-full"
                >
                  {processJob.isPending ? "Processing..." : "Process Job"}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

