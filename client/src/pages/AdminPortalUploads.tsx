import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FolderOpen, Music, Video, Image, FileText } from "lucide-react";
import { Link } from "wouter";

const STATUS_COLORS: Record<string, string> = {
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
};

function formatBytes(bytes: string | number): string {
  const n = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function AdminPortalUploads() {
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | undefined>("pending");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const utils = trpc.useUtils();

  const uploadsQ = trpc.portal.adminListUploads.useQuery({ status: statusFilter, limit: 100, offset: 0 });
  const reviewMut = trpc.portal.adminReviewUpload.useMutation({
    onSuccess: () => { utils.portal.adminListUploads.invalidate(); toast.success("Upload reviewed"); },
    onError: e => toast.error(e.message),
  });

  const uploads = uploadsQ.data ?? [];

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tight">Upload Review Queue</h1>
          <div className="h-0.5 w-12 bg-[#f97316] mt-2" />
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {([undefined, "pending", "approved", "rejected"] as const).map(s => (
            <button
              key={s ?? "all"}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-bold uppercase px-3 py-2 border-2 tracking-widest transition-colors ${
                statusFilter === s ? "border-[#f97316] text-[#f97316] bg-[#f97316]/10" : "border-white/10 text-white/40 hover:border-white/30"
              }`}
            >
              {s ?? "All"}
              {s === "pending" && uploadsQ.data?.length ? ` (${uploadsQ.data.length})` : ""}
            </button>
          ))}
        </div>

        {uploadsQ.isLoading ? (
          <div className="border-2 border-white/10 p-6 text-center text-white/30">Loading...</div>
        ) : uploads.length === 0 ? (
          <div className="border-2 border-white/10 p-8 text-center">
            <FolderOpen className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No uploads to review.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {uploads.map(u => (
              <div key={u.id} className="border-2 border-white/10 p-4">
                <div className="flex items-start gap-3 mb-3">
                  {/* Preview */}
                  <div className="w-20 h-16 bg-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {u.thumbnailUrl ? (
                      <img src={u.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    ) : (u.type === "photo" || u.type === "layout") ? (
                      <a href={u.fileUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                        <img src={u.fileUrl} alt="" className="w-full h-full object-cover" />
                      </a>
                    ) : (
                      <div className="text-white/20">{TYPE_ICON[u.type] || <FolderOpen className="w-5 h-5" />}</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{u.title || u.fileName}</span>
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 border ${STATUS_COLORS[u.status] || ""}`}>
                        {u.status}
                      </span>
                    </div>
                    <div className="text-white/40 text-xs mt-1">
                      <span className="uppercase">{u.type}</span>
                      <span className="mx-1">·</span>
                      {formatBytes(u.fileSize)}
                      {u.rightsConfirmed && <span className="ml-2 text-green-400">✓ Rights confirmed</span>}
                    </div>
                    <Link href={`/admin/portal/client/${u.clientId}`}>
                      <span className="text-[#f97316] text-xs hover:underline">{u.clientName || u.clientEmail}</span>
                    </Link>
                    <div className="flex gap-3 mt-1">
                      <a href={u.fileUrl} target="_blank" rel="noopener noreferrer" className="text-white/30 text-xs hover:text-white hover:underline">
                        View file ↗
                      </a>
                      {(u.type === "track" || u.type === "video") && (
                        <span className="text-white/20 text-xs">
                          {u.duration ? `${Math.floor(parseFloat(u.duration) / 60)}:${String(Math.round(parseFloat(u.duration) % 60)).padStart(2, "0")}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review controls */}
                <div className="flex flex-wrap gap-2 items-center border-t border-white/5 pt-3">
                  <input
                    type="text"
                    placeholder="Review note..."
                    value={notes[u.id] ?? (u.adminNotes || "")}
                    onChange={e => setNotes(n => ({ ...n, [u.id]: e.target.value }))}
                    className="bg-black border border-white/10 text-white text-xs px-2 py-1.5 focus:border-[#f97316] focus:outline-none flex-1 min-w-32"
                  />
                  <button
                    disabled={reviewMut.isPending || u.status === "approved"}
                    onClick={() => reviewMut.mutate({ id: u.id, status: "approved", adminNotes: notes[u.id] || undefined })}
                    className="text-xs font-bold uppercase px-4 py-1.5 border-2 tracking-widest text-green-400 border-green-400/30 hover:bg-green-400/10 transition-colors disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    disabled={reviewMut.isPending || u.status === "rejected"}
                    onClick={() => reviewMut.mutate({ id: u.id, status: "rejected", adminNotes: notes[u.id] || undefined })}
                    className="text-xs font-bold uppercase px-4 py-1.5 border-2 tracking-widest text-red-400 border-red-400/30 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
