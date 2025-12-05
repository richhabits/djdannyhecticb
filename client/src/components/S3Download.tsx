import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Download, FileAudio, Loader2, CheckCircle, 
  AlertCircle, Cloud, HardDrive, Headphones
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface DownloadableFile {
  id: string;
  name: string;
  size: number; // bytes
  format: string;
  quality: string;
  duration?: number; // seconds
}

interface S3DownloadProps {
  fileKey: string;
  fileName: string;
  fileSize?: number;
  format?: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: string) => void;
  className?: string;
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Single file download button
export function S3DownloadButton({
  fileKey,
  fileName,
  fileSize,
  format = "mp3",
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
  className,
}: S3DownloadProps) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "downloading" | "complete" | "error">("idle");

  // In production, this would call a tRPC endpoint to get a presigned S3 URL
  const handleDownload = async () => {
    try {
      setDownloading(true);
      setStatus("downloading");
      onDownloadStart?.();

      // Simulate getting presigned URL from server
      // const { url } = await trpc.mixes.getDownloadUrl.mutate({ key: fileKey });

      // For demo, simulate download with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(i);
      }

      // Simulate file download
      // In production, you would use the presigned URL:
      // const response = await fetch(url);
      // const blob = await response.blob();
      // const downloadUrl = window.URL.createObjectURL(blob);
      // const a = document.createElement("a");
      // a.href = downloadUrl;
      // a.download = fileName;
      // a.click();

      setStatus("complete");
      onDownloadComplete?.();
      toast.success(`${fileName} downloaded successfully!`);
    } catch (error) {
      setStatus("error");
      onDownloadError?.(error instanceof Error ? error.message : "Download failed");
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
      setTimeout(() => {
        setStatus("idle");
        setProgress(0);
      }, 2000);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        onClick={handleDownload}
        disabled={downloading}
        className={cn(
          "w-full",
          status === "complete" && "bg-green-600 hover:bg-green-700",
          status === "error" && "bg-red-600 hover:bg-red-700"
        )}
      >
        {status === "idle" && (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download {format.toUpperCase()}
            {fileSize && <span className="ml-2 opacity-70">({formatBytes(fileSize)})</span>}
          </>
        )}
        {status === "downloading" && (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Downloading... {progress}%
          </>
        )}
        {status === "complete" && (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Downloaded!
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Failed - Retry
          </>
        )}
      </Button>
      
      {status === "downloading" && (
        <Progress value={progress} className="h-2" />
      )}
    </div>
  );
}

// Multi-format download options
export function MixDownloadCard({
  mix,
  className,
}: {
  mix: {
    id: string;
    title: string;
    artist: string;
    coverUrl?: string;
    duration?: number;
    files: DownloadableFile[];
  };
  className?: string;
}) {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  return (
    <Card className={cn("p-6 glass", className)}>
      <div className="flex gap-4">
        {mix.coverUrl && (
          <img
            src={mix.coverUrl}
            alt={mix.title}
            className="w-24 h-24 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="font-bold text-lg">{mix.title}</h3>
          <p className="text-sm text-muted-foreground">{mix.artist}</p>
          {mix.duration && (
            <p className="text-xs text-muted-foreground mt-1">
              Duration: {Math.floor(mix.duration / 60)}:{String(mix.duration % 60).padStart(2, "0")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-sm font-medium">Select format:</p>
        <div className="grid grid-cols-2 gap-2">
          {mix.files.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelectedFormat(file.id)}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all",
                selectedFormat === file.id
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50"
              )}
            >
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4 text-accent" />
                <div className="text-left">
                  <p className="text-sm font-medium">{file.format.toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{file.quality}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </span>
            </button>
          ))}
        </div>

        {selectedFormat && (
          <S3DownloadButton
            fileKey={`mixes/${mix.id}/${selectedFormat}`}
            fileName={`${mix.title.replace(/\s+/g, "_")}.${mix.files.find(f => f.id === selectedFormat)?.format || "mp3"}`}
            fileSize={mix.files.find(f => f.id === selectedFormat)?.size}
            format={mix.files.find(f => f.id === selectedFormat)?.format}
          />
        )}
      </div>
    </Card>
  );
}

// Download manager for multiple files
export function DownloadManager({
  files,
  className,
}: {
  files: {
    id: string;
    name: string;
    size: number;
    key: string;
  }[];
  className?: string;
}) {
  const [downloads, setDownloads] = useState<Map<string, { 
    status: "pending" | "downloading" | "complete" | "error";
    progress: number;
  }>>(new Map());

  const downloadAll = async () => {
    for (const file of files) {
      setDownloads(prev => new Map(prev).set(file.id, { status: "downloading", progress: 0 }));
      
      // Simulate download
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setDownloads(prev => {
          const next = new Map(prev);
          next.set(file.id, { status: "downloading", progress: i });
          return next;
        });
      }
      
      setDownloads(prev => new Map(prev).set(file.id, { status: "complete", progress: 100 }));
    }
    
    toast.success("All files downloaded!");
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const completedCount = Array.from(downloads.values()).filter(d => d.status === "complete").length;

  return (
    <Card className={cn("p-6 glass", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold">Download Queue</h3>
          <p className="text-sm text-muted-foreground">
            {files.length} files · {formatBytes(totalSize)} total
          </p>
        </div>
        <Button onClick={downloadAll} className="gradient-bg">
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </div>

      <div className="space-y-2">
        {files.map((file) => {
          const download = downloads.get(file.id);
          return (
            <div 
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-card/50"
            >
              <FileAudio className="w-5 h-5 text-accent" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <div className="w-24">
                {!download && (
                  <span className="text-xs text-muted-foreground">Pending</span>
                )}
                {download?.status === "downloading" && (
                  <Progress value={download.progress} className="h-2" />
                )}
                {download?.status === "complete" && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {completedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            {completedCount} of {files.length} files downloaded
          </p>
        </div>
      )}
    </Card>
  );
}

// Cloud storage status indicator
export function StorageStatus({
  used,
  total,
  className,
}: {
  used: number;
  total: number;
  className?: string;
}) {
  const percentage = (used / total) * 100;

  return (
    <Card className={cn("p-4 glass", className)}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-accent/10">
          <Cloud className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span>Cloud Storage</span>
            <span>{formatBytes(used)} / {formatBytes(total)}</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </div>
    </Card>
  );
}

export default S3DownloadButton;
