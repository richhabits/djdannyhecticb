import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import { Check, X, FolderOpen, Music, Video, Image as ImageIcon, FileText, LayoutGrid } from "lucide-react";

const TYPE_ICONS: Record<string, typeof Music> = {
  track: Music,
  video: Video,
  photo: ImageIcon,
  layout: LayoutGrid,
  doc: FileText,
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-600",
  approved: "bg-green-600",
  rejected: "bg-red-600",
};

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export default function AdminPortalUploads() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const { data: uploads, isLoading } = trpc.portal.uploads.listAll.useQuery(
    statusFilter === "all" ? {} : { status: statusFilter }
  );

  const updateStatus = trpc.portal.uploads.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Upload reviewed");
      utils.portal.uploads.listAll.invalidate();
    },
    onError: (error) => toast.error(error.message || "Failed to update upload"),
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Admin Access Required</h1>
          <Link href="/">
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8 px-4">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FolderOpen className="w-8 h-8" />
              Portal Uploads
            </h1>
            <p className="text-muted-foreground mt-2">Review client media submissions</p>
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Loading uploads...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploads?.map(({ upload: u, client }) => {
              const TypeIcon = TYPE_ICONS[u.type] ?? FileText;
              return (
                <Card key={u.id} className="p-4 glass">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="w-5 h-5 text-accent" />
                      <Badge className={STATUS_COLORS[u.status]}>{u.status}</Badge>
                    </div>
                    <Badge variant="outline" className="capitalize">{client.role}</Badge>
                  </div>

                  {u.type === "photo" || u.type === "layout" ? (
                    <img src={u.fileUrl} alt={u.title || u.fileName} className="w-full h-32 object-cover rounded-lg mb-2" />
                  ) : u.type === "video" && u.thumbnailUrl ? (
                    <img src={u.thumbnailUrl} alt={u.title || u.fileName} className="w-full h-32 object-cover rounded-lg mb-2" />
                  ) : u.type === "track" ? (
                    <audio controls src={u.fileUrl} className="w-full mb-2" />
                  ) : (
                    <a href={u.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline block mb-2">
                      View file
                    </a>
                  )}

                  <p className="font-semibold truncate">{u.title || u.fileName}</p>
                  <p className="text-xs text-muted-foreground mb-1">{client.name || client.email} · {formatBytes(u.fileSize)}</p>
                  {u.description && <p className="text-sm text-muted-foreground mb-3">{u.description}</p>}

                  {u.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ id: u.id, status: "approved" })}
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700"
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ id: u.id, status: "rejected" })}
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
            {!uploads?.length && (
              <p className="col-span-full text-center text-muted-foreground py-12">No uploads found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
