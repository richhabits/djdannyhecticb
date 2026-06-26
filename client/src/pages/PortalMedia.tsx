import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { PortalNav } from "@/components/PortalNav";
import { PortalGuard } from "@/components/PortalGuard";
import { toast } from "sonner";
import { Trash2, Upload, Music, Video, Image as ImageIcon, FileText, LayoutGrid } from "lucide-react";
import { uploadPortalFile, type PortalUploadType } from "@/lib/portalUpload";

const TYPE_OPTIONS: { value: PortalUploadType; label: string; accept: string; icon: typeof Music }[] = [
  { value: "track", label: "Track", accept: "audio/*", icon: Music },
  { value: "video", label: "Video", accept: "video/*", icon: Video },
  { value: "photo", label: "Photo", accept: "image/*", icon: ImageIcon },
  { value: "layout", label: "Stage Layout", accept: "image/*,.pdf", icon: LayoutGrid },
  { value: "doc", label: "Document", accept: ".pdf,.doc,.docx,.txt", icon: FileText },
];

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

function MediaContent() {
  const utils = trpc.useUtils();
  const { data: uploads } = trpc.portal.uploads.listMine.useQuery({});
  const { data: usage } = trpc.portal.uploads.usage.useQuery();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<PortalUploadType>("track");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const deleteUpload = trpc.portal.uploads.delete.useMutation({
    onSuccess: () => {
      toast.success("Upload deleted");
      utils.portal.uploads.listMine.invalidate();
      utils.portal.uploads.usage.invalidate();
    },
    onError: (error) => toast.error(error.message || "Failed to delete"),
  });

  const handleFileSelect = async (file: File | undefined) => {
    if (!file) return;
    if (!rightsConfirmed) {
      toast.error("Please confirm you own the rights to this content before uploading");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      await uploadPortalFile({
        file,
        type,
        title: title || file.name,
        description: description || undefined,
        rightsConfirmed,
        onProgress: setProgress,
      });

      toast.success("Upload complete — pending review");
      utils.portal.uploads.listMine.invalidate();
      utils.portal.uploads.usage.invalidate();
      setTitle("");
      setDescription("");
      setRightsConfirmed(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const usagePercent = usage ? Math.min(100, (usage.bytesUsed / usage.quotaBytes) * 100) : 0;
  const selectedType = TYPE_OPTIONS.find((t) => t.value === type)!;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-6xl mx-auto">
      <PortalNav />

      <h1 className="text-3xl font-bold mb-2">Media Library</h1>
      {usage && (
        <div className="mb-8 max-w-sm">
          <Progress value={usagePercent} className="mb-1" />
          <p className="text-xs text-muted-foreground">
            {formatBytes(usage.bytesUsed)} / {formatBytes(usage.quotaBytes)} used
          </p>
        </div>
      )}

      <Card className="p-6 glass mb-8">
        <h2 className="text-xl font-bold mb-4">Upload New File</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as PortalUploadType)}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Checkbox id="rights" checked={rightsConfirmed} onCheckedChange={(v) => setRightsConfirmed(v === true)} />
          <Label htmlFor="rights" className="text-sm font-normal">
            I confirm I own or have the rights to this content
          </Label>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={selectedType.accept}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !rightsConfirmed}
          className="bg-gradient-to-r from-orange-600 to-amber-600"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? `Uploading... ${progress.toFixed(0)}%` : "Choose File"}
        </Button>
        {uploading && <Progress value={progress} className="mt-3" />}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {uploads?.map((u) => {
          const TypeIcon = TYPE_OPTIONS.find((t) => t.value === u.type)?.icon ?? FileText;
          return (
            <Card key={u.id} className="p-4 glass">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-5 h-5 text-accent" />
                  <Badge className={STATUS_COLORS[u.status]}>{u.status}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteUpload.mutate({ id: u.id })}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {u.type === "photo" || u.type === "layout" ? (
                <img src={u.fileUrl} alt={u.title || u.fileName} className="w-full h-32 object-cover rounded-lg mb-2" />
              ) : u.type === "video" && u.thumbnailUrl ? (
                <img src={u.thumbnailUrl} alt={u.title || u.fileName} className="w-full h-32 object-cover rounded-lg mb-2" />
              ) : u.type === "track" ? (
                <audio controls src={u.fileUrl} className="w-full mb-2" />
              ) : null}

              <p className="font-semibold truncate">{u.title || u.fileName}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(u.fileSize)}</p>
            </Card>
          );
        })}
        {!uploads?.length && (
          <p className="col-span-full text-center text-muted-foreground py-12">No uploads yet.</p>
        )}
      </div>
    </div>
  );
}

export default function PortalMedia() {
  return (
    <PortalGuard>
      <MediaContent />
    </PortalGuard>
  );
}
