import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import { Link } from "wouter";

const STATUS_COLORS: Record<string, string> = {
  enquiry: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  confirmed: "text-green-400 border-green-400/30 bg-green-400/10",
  completed: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  cancelled: "text-red-400 border-red-400/30 bg-red-400/10",
};

export default function AdminPortalBookings() {
  const [statusFilter, setStatusFilter] = useState<"enquiry" | "confirmed" | "completed" | "cancelled" | undefined>(undefined);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const utils = trpc.useUtils();

  const bookingsQ = trpc.portal.adminListBookings.useQuery({ status: statusFilter, limit: 100, offset: 0 });
  const updateMut = trpc.portal.adminUpdateBooking.useMutation({
    onSuccess: () => { utils.portal.adminListBookings.invalidate(); toast.success("Updated"); },
    onError: e => toast.error(e.message),
  });

  const bookings = bookingsQ.data ?? [];

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tight">Client Bookings</h1>
          <div className="h-0.5 w-12 bg-[#f97316] mt-2" />
        </div>

        {/* Status filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {([undefined, "enquiry", "confirmed", "completed", "cancelled"] as const).map(s => (
            <button
              key={s ?? "all"}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-bold uppercase px-3 py-2 border-2 tracking-widest transition-colors ${
                statusFilter === s ? "border-[#f97316] text-[#f97316] bg-[#f97316]/10" : "border-white/10 text-white/40 hover:border-white/30"
              }`}
            >
              {s ?? "All"}
            </button>
          ))}
        </div>

        {bookingsQ.isLoading ? (
          <div className="border-2 border-white/10 p-6 text-center text-white/30">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="border-2 border-white/10 p-8 text-center">
            <Calendar className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No bookings found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="border-2 border-white/10 p-4">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white">{b.eventType}</span>
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 border ${STATUS_COLORS[b.status] || ""}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="text-white/40 text-xs mt-1">
                      {new Date(b.eventDate).toLocaleDateString("en-GB", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                      {" — "}{b.location}{b.venue ? ` (${b.venue})` : ""}
                    </div>
                    <Link href={`/admin/portal/client/${b.clientId}`}>
                      <span className="text-[#f97316] text-xs hover:underline">
                        {b.clientName || b.clientEmail} ({b.clientRole?.replace("_", " ")})
                      </span>
                    </Link>
                    {b.requirements && (
                      <div className="mt-2 text-xs text-white/40 bg-white/5 p-2 border-l-2 border-white/10">
                        {b.requirements}
                      </div>
                    )}
                    {b.adminNotes && (
                      <div className="mt-1 text-xs text-[#f97316]/70 italic">Note: {b.adminNotes}</div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-2 items-center border-t border-white/5 pt-3">
                  <input
                    type="text"
                    placeholder="Admin note..."
                    value={notes[b.id] ?? (b.adminNotes || "")}
                    onChange={e => setNotes(n => ({ ...n, [b.id]: e.target.value }))}
                    className="bg-black border border-white/10 text-white text-xs px-2 py-1.5 focus:border-[#f97316] focus:outline-none flex-1 min-w-32"
                  />
                  {(["enquiry", "confirmed", "completed", "cancelled"] as const).map(s => (
                    <button
                      key={s}
                      disabled={updateMut.isPending || b.status === s}
                      onClick={() => updateMut.mutate({ id: b.id, status: s, adminNotes: notes[b.id] || b.adminNotes || undefined })}
                      className={`text-xs font-bold uppercase px-3 py-1.5 border-2 tracking-widest transition-colors disabled:opacity-40 ${
                        b.status === s ? "border-[#f97316] text-[#f97316] bg-[#f97316]/10" : "border-white/10 text-white/40 hover:border-white/30"
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
    </div>
  );
}
