import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Calendar, FolderOpen, HardDrive, Play, Image, FileText, Video, Music } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  enquiry: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  confirmed: "text-green-400 border-green-400/30 bg-green-400/10",
  completed: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  cancelled: "text-red-400 border-red-400/30 bg-red-400/10",
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

export default function AdminPortalClient() {
  const params = useParams<{ id: string }>();
  const userId = parseInt(params.id);
  const utils = trpc.useUtils();

  const clientQ = trpc.portal.adminGetClient.useQuery({ userId });
  const updateBookingMut = trpc.portal.adminUpdateBooking.useMutation({
    onSuccess: () => { utils.portal.adminGetClient.invalidate(); toast.success("Booking updated"); },
    onError: e => toast.error(e.message),
  });
  const reviewUploadMut = trpc.portal.adminReviewUpload.useMutation({
    onSuccess: () => { utils.portal.adminGetClient.invalidate(); toast.success("Upload reviewed"); },
    onError: e => toast.error(e.message),
  });

  const [bookingNotes, setBookingNotes] = useState<Record<number, string>>({});
  const [uploadNotes, setUploadNotes] = useState<Record<number, string>>({});

  if (clientQ.isLoading) {
    return <div className="min-h-screen bg-black text-white/30 flex items-center justify-center">Loading...</div>;
  }
  if (!clientQ.data) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Client not found</div>;
  }

  const { user, profile, bookings, uploads, storage } = clientQ.data;
  const bytesUsed = parseInt(storage.bytesUsed);
  const usagePct = Math.min(100, (bytesUsed / (5 * 1024 * 1024 * 1024)) * 100);

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link href="/admin/portal">
            <button className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs uppercase tracking-widest mb-3">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to clients
            </button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 flex items-center justify-center font-black text-xl">
              {(user.name || user.email || "?")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">{user.displayName || user.name}</h1>
              <div className="text-white/40 text-sm">{user.email}</div>
              <div className="text-[#f97316] text-xs uppercase tracking-widest font-bold mt-0.5">
                {user.role?.replace("_", " ")}
              </div>
            </div>
          </div>
        </div>

        {/* Profile & Storage */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="border-2 border-white/10 p-3">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Company</div>
            <div className="text-white font-bold text-sm">{profile?.company || "—"}</div>
          </div>
          <div className="border-2 border-white/10 p-3">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Phone</div>
            <div className="text-white font-bold text-sm">{profile?.phone || "—"}</div>
          </div>
          <div className="border-2 border-white/10 p-3">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Storage</div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-white font-bold text-sm">{formatBytes(bytesUsed)}</span>
              <span className="text-white/30 text-xs">/ 5 GB</span>
            </div>
            <div className="w-full bg-white/10 h-1.5">
              <div className={`h-1.5 ${usagePct > 90 ? "bg-red-500" : "bg-[#f97316]"}`} style={{ width: `${usagePct}%` }} />
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#f97316]" />
            Bookings ({bookings.length})
          </h2>
          {bookings.length === 0 ? (
            <div className="border-2 border-white/10 p-4 text-center text-white/30 text-sm">No bookings</div>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="border-2 border-white/10 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white">{b.eventType}</div>
                      <div className="text-white/40 text-xs mt-1">
                        {new Date(b.eventDate).toLocaleDateString("en-GB")} — {b.location}
                        {b.venue ? ` (${b.venue})` : ""}
                        {b.duration ? ` · ${b.duration}` : ""}
                        {b.budget ? ` · £${parseFloat(b.budget).toLocaleString()}` : ""}
                      </div>
                      {b.requirements && (
                        <div className="mt-1 text-white/40 text-xs bg-white/5 p-2 border-l-2 border-white/10">
                          {b.requirements}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-bold uppercase px-2 py-1 border flex-shrink-0 ${STATUS_COLORS[b.status] || ""}`}>
                      {b.status}
                    </span>
                  </div>

                  {/* Admin controls */}
                  <div className="flex flex-wrap gap-2 items-center border-t border-white/5 pt-3">
                    <input
                      type="text"
                      placeholder="Admin note (optional)"
                      value={bookingNotes[b.id] ?? (b.adminNotes || "")}
                      onChange={e => setBookingNotes(n => ({ ...n, [b.id]: e.target.value }))}
                      className="bg-black border border-white/10 text-white text-xs px-2 py-1.5 focus:border-[#f97316] focus:outline-none flex-1 min-w-32"
                    />
                    {(["enquiry", "confirmed", "completed", "cancelled"] as const).map(s => (
                      <button
                        key={s}
                        disabled={updateBookingMut.isPending || b.status === s}
                        onClick={() => updateBookingMut.mutate({ id: b.id, status: s, adminNotes: bookingNotes[b.id] || b.adminNotes || undefined })}
                        className={`text-xs font-bold uppercase px-3 py-1.5 border-2 tracking-widest transition-colors disabled:opacity-40 ${
                          b.status === s
                            ? "border-[#f97316] text-[#f97316] bg-[#f97316]/10"
                            : "border-white/10 text-white/40 hover:border-white/30"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Uploads */}
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-[#f97316]" />
            Uploads ({uploads.length})
          </h2>
          {uploads.length === 0 ? (
            <div className="border-2 border-white/10 p-4 text-center text-white/30 text-sm">No uploads</div>
          ) : (
            <div className="space-y-3">
              {uploads.map(u => (
                <div key={u.id} className="border-2 border-white/10 p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Preview */}
                    <div className="w-16 h-16 bg-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {u.thumbnailUrl ? (
                        <img src={u.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : u.type === "photo" || u.type === "layout" ? (
                        <a href={u.fileUrl} target="_blank" rel="noopener noreferrer">
                          <img src={u.fileUrl} alt="" className="w-full h-full object-cover" />
                        </a>
                      ) : (
                        <div className="text-white/20">{TYPE_ICON[u.type]}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm">{u.title || u.fileName}</div>
                      <div className="text-white/40 text-xs mt-1">
                        <span className="uppercase">{u.type}</span>
                        <span className="mx-1">·</span>
                        {formatBytes(u.fileSize)}
                        {u.rightsConfirmed && <span className="ml-2 text-green-400">✓ Rights confirmed</span>}
                      </div>
                      {u.description && <div className="text-white/30 text-xs mt-0.5">{u.description}</div>}
                      <a
                        href={u.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#f97316] text-xs hover:underline mt-1 inline-block"
                      >
                        View file ↗
                      </a>
                    </div>
                    <span className={`text-xs font-bold uppercase px-2 py-1 border flex-shrink-0 ${STATUS_COLORS[u.status] || ""}`}>
                      {u.status}
                    </span>
                  </div>

                  {/* Admin review */}
                  <div className="flex flex-wrap gap-2 items-center border-t border-white/5 pt-3">
                    <input
                      type="text"
                      placeholder="Review note (optional)"
                      value={uploadNotes[u.id] ?? (u.adminNotes || "")}
                      onChange={e => setUploadNotes(n => ({ ...n, [u.id]: e.target.value }))}
                      className="bg-black border border-white/10 text-white text-xs px-2 py-1.5 focus:border-[#f97316] focus:outline-none flex-1 min-w-32"
                    />
                    <button
                      disabled={reviewUploadMut.isPending || u.status === "approved"}
                      onClick={() => reviewUploadMut.mutate({ id: u.id, status: "approved", adminNotes: uploadNotes[u.id] || undefined })}
                      className="text-xs font-bold uppercase px-3 py-1.5 border-2 tracking-widest text-green-400 border-green-400/30 hover:bg-green-400/10 transition-colors disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      disabled={reviewUploadMut.isPending || u.status === "rejected"}
                      onClick={() => reviewUploadMut.mutate({ id: u.id, status: "rejected", adminNotes: uploadNotes[u.id] || undefined })}
                      className="text-xs font-bold uppercase px-3 py-1.5 border-2 tracking-widest text-red-400 border-red-400/30 hover:bg-red-400/10 transition-colors disabled:opacity-40"
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
    </div>
  );
}
