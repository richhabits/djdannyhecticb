import { useState } from "react";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import { PortalLayout } from "@/components/PortalLayout";
import { trpc } from "@/lib/trpc";
import { Plus, X, Calendar } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  enquiry: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  confirmed: "text-green-400 border-green-400/30 bg-green-400/10",
  completed: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  cancelled: "text-red-400 border-red-400/30 bg-red-400/10",
};

const EVENT_TYPES = [
  "Club Night", "Private Party", "Corporate Event", "Wedding", "Festival",
  "Brand Activation", "Radio Session", "Live Stream", "Other"
];

const DURATIONS = ["1 hour", "2 hours", "3 hours", "4 hours", "5 hours", "6+ hours"];

export default function PortalBookings() {
  const { user } = usePortalAuth();
  const utils = trpc.useUtils();
  const bookingsQ = trpc.portal.listBookings.useQuery();
  const createMut = trpc.portal.createBooking.useMutation({
    onSuccess: () => {
      utils.portal.listBookings.invalidate();
      setShowForm(false);
      resetForm();
      toast.success("Booking enquiry submitted! Danny will be in touch soon.");
    },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [requirements, setRequirements] = useState("");

  function resetForm() {
    setEventType(""); setEventDate(""); setVenue(""); setLocation("");
    setDuration(""); setBudget(""); setRequirements("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMut.mutate({
      eventType,
      eventDate,
      venue: venue || undefined,
      location,
      duration: duration || undefined,
      budget: budget ? parseFloat(budget) : undefined,
      requirements: requirements || undefined,
    });
  }

  const bookings = bookingsQ.data ?? [];

  return (
    <PortalLayout title="Bookings">
      <div className="space-y-4">
        {/* Header action */}
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-sm">Submit and track your booking requests</p>
          <button
            onClick={() => setShowForm(v => !v)}
            className="bg-[#f97316] text-black text-xs font-black uppercase tracking-widest px-4 py-2 hover:bg-orange-400 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Booking
          </button>
        </div>

        {/* New booking form */}
        {showForm && (
          <div className="border-2 border-[#f97316]/40 bg-black">
            <div className="border-b-2 border-[#f97316]/20 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">New Booking Enquiry</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }}>
                <X className="w-4 h-4 text-white/40 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Event Type *</label>
                  <select
                    value={eventType}
                    onChange={e => setEventType(e.target.value)}
                    required
                    className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                  >
                    <option value="">Select type...</option>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Event Date *</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Location / City *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required
                    className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                    placeholder="e.g. London"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Venue Name</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Set Length</label>
                  <select
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                  >
                    <option value="">Select...</option>
                    {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Budget (£)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    min={0}
                    step={50}
                    className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Requirements / Notes</label>
                <textarea
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                  rows={4}
                  maxLength={5000}
                  className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none resize-none"
                  placeholder="Genre preferences, technical requirements, special requests..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="bg-[#f97316] text-black font-black uppercase tracking-widest px-6 py-2.5 text-sm hover:bg-orange-400 transition-colors disabled:opacity-50"
                >
                  {createMut.isPending ? "Submitting..." : "Submit Enquiry"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="border-2 border-white/20 text-white/60 font-bold uppercase tracking-widest px-4 py-2.5 text-sm hover:border-white/40"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Booking list */}
        {bookingsQ.isLoading ? (
          <div className="border-2 border-white/10 p-6 text-center text-white/30 text-sm">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="border-2 border-white/10 p-8 text-center">
            <Calendar className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No bookings yet. Submit your first enquiry above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="border-2 border-white/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-white font-bold text-sm">{b.eventType}</div>
                    <div className="text-white/40 text-xs mt-1 space-y-0.5">
                      <div>{new Date(b.eventDate).toLocaleDateString("en-GB", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</div>
                      <div>{b.location}{b.venue ? ` — ${b.venue}` : ""}</div>
                      {b.duration && <div>Set length: {b.duration}</div>}
                      {b.budget && <div>Budget: £{parseFloat(b.budget).toLocaleString()}</div>}
                    </div>
                    {b.adminNotes && (
                      <div className="mt-2 p-2 bg-white/5 border-l-2 border-[#f97316]/50 text-white/60 text-xs">
                        <strong className="text-[#f97316]">Danny's note:</strong> {b.adminNotes}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-bold uppercase px-2 py-1 border flex-shrink-0 ${STATUS_COLORS[b.status] || "text-white/60"}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
