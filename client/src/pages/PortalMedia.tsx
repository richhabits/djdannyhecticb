import { useState, useRef, useCallback } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import {
  Upload, Trash2, Play, Pause, Image, FileText, Video, Music, FolderOpen,
  CheckSquare, Square, X, RefreshCw
} from "lucide-react";

const UPLOAD_TYPES = [
  { value: "track", label: "Track / Mix", accept: "audio/*", icon: <Music className="w-4 h-4" /> },
  { value: "video", label: "Video", accept: "video/*", icon: <Video className="w-4 h-4" /> },
  { value: "photo", label: "Photo / Image", accept: "image/*", icon: <Image className="w-4 h-4" /> },
  { value: "layout", label: "Layout / Artwork", accept: "image/*", icon: <Image className="w-4 h-4" /> },
  { value: "doc", label: "Document", accept: ".pdf,.doc,.docx", icon: <FileText className="w-4 h-4" /> },
];

const STATUS_BADGE: Record<string, string> = {
  pending: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  approved: "text-green-400 border-green-400/30 bg-green-400/10",
  rejected: "text-red-400 border-red-400/30 bg-red-400/10",
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  track: <Music className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  photo: <Image className="w-4 h-4" />,
  layout: <Image className="w-4 h-4" />,
  doc: <FileText className="w-4 h-4" />,
  playlist: <FolderOpen className="w-4 h-4" />,
};

function formatBytes(bytes: string | number): string {
  const n = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function extractMediaMetadata(file: File): Promise<{ duration?: number; thumbnailUrl?: string }> {
  return new Promise(resolve => {
    if (file.type.startsWith("audio/")) {
      const audio = document.createElement("audio");
      audio.preload = "metadata";
      const url = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({ duration: Math.round(audio.duration) });
      };
      audio.onerror = () => { URL.revokeObjectURL(url); resolve({}); };
      audio.src = url;
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      const url = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        video.currentTime = 1;
      };
      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);
        URL.revokeObjectURL(url);
        resolve({ duration: Math.round(video.duration), thumbnailUrl });
      };
      video.onerror = () => { URL.revokeObjectURL(url); resolve({}); };
      video.src = url;
    } else {
      resolve({});
    }
  });
}

export default function PortalMedia() {
  const utils = trpc.useUtils();
  const uploadsQ = trpc.portal.listUploads.useQuery();
  const storageQ = trpc.portal.getStorageUsage.useQuery();
  const deleteMut = trpc.portal.deleteUpload.useMutation({
    onSuccess: () => {
      utils.portal.listUploads.invalidate();
      utils.portal.getStorageUsage.invalidate();
      toast.success("File deleted");
    },
    onError: e => toast.error(e.message),
  });

  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState("track");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploads = (uploadsQ.data ?? []).filter(u => filterType === "all" || u.type === filterType);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file) return;
    if (!rightsConfirmed) {
      toast.error("Please confirm you own or have the rights to this content");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const meta = await extractMediaMetadata(file);

      const clientPayload = JSON.stringify({
        uploadType,
        title: title || file.name,
        description,
        rightsConfirmed,
        duration: meta.duration,
        thumbnailUrl: meta.thumbnailUrl || undefined,
      });

      await upload(file.name, file, {
        access: uploadType === "track" || uploadType === "doc" ? "private" : "public",
        handleUploadUrl: "/api/portal/upload-url",
        clientPayload,
        multipart: uploadType === "track" || uploadType === "video",
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });

      await utils.portal.listUploads.invalidate();
      await utils.portal.getStorageUsage.invalidate();
      toast.success("Upload complete! Pending review.");
      setShowUpload(false);
      setFile(null);
      setTitle("");
      setDescription("");
      setRightsConfirmed(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [file, title, description, rightsConfirmed, uploadType, utils]);

  const togglePlay = (id: number, url: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(url);
      audioRef.current.play().catch(() => toast.error("Cannot play private audio directly"));
      audioRef.current.onended = () => setPlayingId(null);
      setPlayingId(id);
    }
  };

  const acceptForType = UPLOAD_TYPES.find(t => t.value === uploadType)?.accept || "*";

  const bytesUsed = storageQ.data ? parseInt(storageQ.data.bytesUsed) : 0;
  const usagePct = Math.min(100, (bytesUsed / (5 * 1024 * 1024 * 1024)) * 100);

  return (
    <PortalLayout title="Media Library">
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowUpload(v => !v)}
            className="bg-[#f97316] text-black text-xs font-black uppercase tracking-widest px-4 py-2 hover:bg-orange-400 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>

          {/* Type filter */}
          <div className="flex gap-1 flex-wrap">
            {["all", "track", "video", "photo", "layout", "doc"].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`text-xs font-bold uppercase px-3 py-1.5 border-2 tracking-widest transition-colors ${
                  filterType === t ? "border-[#f97316] text-[#f97316] bg-[#f97316]/10" : "border-white/10 text-white/40 hover:border-white/30"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Storage mini-meter */}
          <div className="ml-auto flex items-center gap-2 text-xs text-white/40">
            <span>{formatBytes(bytesUsed)} / 5 GB</span>
            <div className="w-20 bg-white/10 h-1.5">
              <div className={`h-1.5 ${usagePct > 90 ? "bg-red-500" : "bg-[#f97316]"}`} style={{ width: `${usagePct}%` }} />
            </div>
          </div>
        </div>

        {/* Upload panel */}
        {showUpload && (
          <div className="border-2 border-[#f97316]/40 bg-black">
            <div className="border-b-2 border-[#f97316]/20 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Upload New File</h3>
              <button onClick={() => setShowUpload(false)}>
                <X className="w-4 h-4 text-white/40 hover:text-white" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Type selection */}
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">File Type</label>
                <div className="flex flex-wrap gap-2">
                  {UPLOAD_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => { setUploadType(t.value); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className={`flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-2 border-2 tracking-widest transition-colors ${
                        uploadType === t.value ? "border-[#f97316] text-[#f97316] bg-[#f97316]/10" : "border-white/10 text-white/40 hover:border-white/30"
                      }`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* File picker */}
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">File</label>
                <div
                  className="border-2 border-dashed border-white/20 hover:border-[#f97316]/50 p-6 text-center cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {file ? (
                    <div className="text-white">
                      <div className="font-bold text-sm">{file.name}</div>
                      <div className="text-white/40 text-xs mt-1">{formatBytes(file.size)}</div>
                    </div>
                  ) : (
                    <div className="text-white/30">
                      <Upload className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm">Click to select or drag & drop</div>
                      <div className="text-xs mt-1 uppercase tracking-widest">{acceptForType.replace(/\*/g, "files")}</div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptForType}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {file && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                        placeholder="Title for this file"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Description</label>
                      <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  {/* Rights consent */}
                  {(uploadType === "track" || uploadType === "video" || uploadType === "playlist") && (
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <button
                        type="button"
                        onClick={() => setRightsConfirmed(v => !v)}
                        className={`flex-shrink-0 mt-0.5 ${rightsConfirmed ? "text-[#f97316]" : "text-white/30 group-hover:text-white/60"} transition-colors`}
                      >
                        {rightsConfirmed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>
                      <span className="text-xs text-white/60 leading-relaxed">
                        I confirm I own or have the necessary rights to this content and authorise DJ Danny Hectic B to use it in accordance with the portal terms.
                      </span>
                    </label>
                  )}

                  {/* Progress bar */}
                  {uploading && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/40 uppercase tracking-widest">Uploading...</span>
                        <span className="text-xs text-[#f97316] font-bold">{progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-2">
                        <div
                          className="h-2 bg-[#f97316] transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleUpload}
                      disabled={uploading || !file}
                      className="bg-[#f97316] text-black font-black uppercase tracking-widest px-6 py-2.5 text-sm hover:bg-orange-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploading ? `Uploading ${progress}%` : "Upload"}
                    </button>
                    <button
                      onClick={() => { setShowUpload(false); setFile(null); setTitle(""); setDescription(""); setRightsConfirmed(false); }}
                      className="border-2 border-white/20 text-white/60 font-bold uppercase tracking-widest px-4 py-2.5 text-sm hover:border-white/40"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Upload grid */}
        {uploadsQ.isLoading ? (
          <div className="border-2 border-white/10 p-6 text-center text-white/30 text-sm">Loading...</div>
        ) : uploads.length === 0 ? (
          <div className="border-2 border-white/10 p-8 text-center">
            <FolderOpen className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">
              {filterType === "all" ? "No files uploaded yet." : `No ${filterType} files.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploads.map(u => (
              <div key={u.id} className="border-2 border-white/10 group">
                {/* Thumbnail or type icon */}
                <div className="relative bg-white/5 h-32 flex items-center justify-center overflow-hidden">
                  {u.thumbnailUrl ? (
                    <img src={u.thumbnailUrl} alt={u.title || u.fileName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white/20">
                      {TYPE_ICON[u.type] || <FolderOpen className="w-8 h-8" />}
                    </div>
                  )}
                  {/* Play button for tracks */}
                  {u.type === "track" && (
                    <button
                      onClick={() => togglePlay(u.id, u.fileUrl)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {playingId === u.id
                        ? <Pause className="w-8 h-8 text-[#f97316]" />
                        : <Play className="w-8 h-8 text-white" />
                      }
                    </button>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-white text-sm font-bold truncate">{u.title || u.fileName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/30 text-xs uppercase tracking-widest">{u.type}</span>
                        <span className="text-white/20 text-xs">·</span>
                        <span className="text-white/30 text-xs">{formatBytes(u.fileSize)}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 border flex-shrink-0 ${STATUS_BADGE[u.status] || ""}`}>
                      {u.status}
                    </span>
                  </div>

                  {u.adminNotes && u.status === "rejected" && (
                    <div className="mt-2 text-xs text-red-400/80 border-l-2 border-red-500/30 pl-2">
                      {u.adminNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                    <span className="text-white/20 text-xs">
                      {new Date(u.createdAt).toLocaleDateString("en-GB")}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm("Delete this file permanently?")) {
                          deleteMut.mutate({ id: u.id });
                        }
                      }}
                      disabled={deleteMut.isPending}
                      className="text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
