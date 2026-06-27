import { useLocation } from "wouter";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import { PortalLayout } from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Calendar, FolderOpen, HardDrive, Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  enquiry: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  confirmed: "text-green-400 border-green-400/30 bg-green-400/10",
  completed: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  cancelled: "text-red-400 border-red-400/30 bg-red-400/10",
  pending: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  approved: "text-green-400 border-green-400/30 bg-green-400/10",
  rejected: "text-red-400 border-red-400/30 bg-red-400/10",
};

function formatBytes(bytes: string | number): string {
  const n = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function PortalDashboard() {
  const { user } = usePortalAuth();
  const [, navigate] = useLocation();
  const bookingsQ = trpc.portal.listBookings.useQuery();
  const uploadsQ = trpc.portal.listUploads.useQuery();
  const storageQ = trpc.portal.getStorageUsage.useQuery();

  if (!user) {
    navigate("/portal/login");
    return null;
  }

  const bookings = bookingsQ.data ?? [];
  const uploads = uploadsQ.data ?? [];
  const storage = storageQ.data;

  const bytesUsed = storage ? parseInt(storage.bytesUsed) : 0;
  const quotaBytes = 5 * 1024 * 1024 * 1024;
  const usagePct = Math.min(100, (bytesUsed / quotaBytes) * 100);

  const recentBookings = bookings.slice(0, 3);
  const recentUploads = uploads.slice(0, 4);
  const pendingUploads = uploads.filter(u => u.status === "pending").length;

  return (
    <PortalLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="border-2 border-[#f97316]/30 bg-[#f97316]/5 p-4">
          <p className="text-white/60 text-xs uppercase tracking-widest mb-0.5">Welcome back</p>
          <h2 className="text-xl font-black text-white uppercase">{user.name}</h2>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Bookings" value={bookings.length} icon={<Calendar className="w-4 h-4" />} />
          <StatCard label="Uploads" value={uploads.length} icon={<FolderOpen className="w-4 h-4" />} />
          <StatCard
            label="Pending Review"
            value={pendingUploads}
            icon={<FolderOpen className="w-4 h-4" />}
            accent={pendingUploads > 0}
          />
          <StatCard label="Storage" value={formatBytes(bytesUsed)} icon={<HardDrive className="w-4 h-4" />} />
        </div>

        {/* Storage meter */}
        {storage && (
          <div className="border-2 border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Storage Usage</span>
              <span className="text-xs text-white/40">{formatBytes(bytesUsed)} / 5 GB</span>
            </div>
            <div className="w-full bg-white/10 h-2">
              <div
                className={`h-2 transition-all ${usagePct > 90 ? "bg-red-500" : usagePct > 70 ? "bg-yellow-500" : "bg-[#f97316]"}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            <div className="text-xs text-white/30 mt-1">{usagePct.toFixed(1)}% used</div>
          </div>
        )}

        {/* Recent Bookings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Bookings</h3>
            <Link href="/portal/bookings" className="text-[#f97316] text-xs uppercase tracking-widest flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="border-2 border-white/10 p-6 text-center">
              <p className="text-white/30 text-sm mb-3">No bookings yet</p>
              <Link href="/portal/bookings">
                <button className="bg-[#f97316] text-black text-xs font-black uppercase tracking-widest px-4 py-2 hover:bg-orange-400 transition-colors flex items-center gap-1.5 mx-auto">
                  <Plus className="w-3 h-3" /> New Booking
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentBookings.map(b => (
                <div key={b.id} className="border-2 border-white/10 p-3 flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-bold">{b.eventType}</div>
                    <div className="text-white/40 text-xs mt-0.5">
                      {new Date(b.eventDate).toLocaleDateString("en-GB")} — {b.location}
                    </div>
                  </div>
                  <span className={`text-xs font-bold uppercase px-2 py-1 border ${STATUS_COLORS[b.status] || "text-white/60"}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Uploads */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Uploads</h3>
            <Link href="/portal/media" className="text-[#f97316] text-xs uppercase tracking-widest flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentUploads.length === 0 ? (
            <div className="border-2 border-white/10 p-6 text-center">
              <p className="text-white/30 text-sm mb-3">No uploads yet</p>
              <Link href="/portal/media">
                <button className="bg-[#f97316] text-black text-xs font-black uppercase tracking-widest px-4 py-2 hover:bg-orange-400 transition-colors flex items-center gap-1.5 mx-auto">
                  <Plus className="w-3 h-3" /> Upload Files
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recentUploads.map(u => (
                <div key={u.id} className="border-2 border-white/10 p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-white text-sm font-bold truncate">{u.title || u.fileName}</div>
                    <div className="text-white/40 text-xs uppercase mt-0.5">{u.type}</div>
                  </div>
                  <span className={`text-xs font-bold uppercase px-2 py-1 border flex-shrink-0 ${STATUS_COLORS[u.status] || ""}`}>
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: string | number; icon: ReactNode; accent?: boolean }) {
  return (
    <div className={`border-2 p-3 ${accent ? "border-[#f97316]/50 bg-[#f97316]/5" : "border-white/10"}`}>
      <div className={`mb-1 ${accent ? "text-[#f97316]" : "text-white/30"}`}>{icon}</div>
      <div className={`text-xl font-black ${accent ? "text-[#f97316]" : "text-white"}`}>{value}</div>
      <div className="text-xs text-white/40 uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

// Need to add ReactNode import
import { ReactNode } from "react";
