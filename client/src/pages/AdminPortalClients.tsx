import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Users, Search, ArrowRight } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  booking_client: "Booking Client",
  artist: "Artist",
  brand: "Brand",
};

const ROLE_COLORS: Record<string, string> = {
  booking_client: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  artist: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  brand: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
};

export default function AdminPortalClients() {
  const [roleFilter, setRoleFilter] = useState<"booking_client" | "artist" | "brand" | undefined>(undefined);
  const [search, setSearch] = useState("");

  const clientsQ = trpc.portal.adminListClients.useQuery({ role: roleFilter, limit: 100, offset: 0 });
  const clients = (clientsQ.data ?? []).filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tight">Portal Clients</h1>
          <div className="h-0.5 w-12 bg-[#f97316] mt-2" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-black border-2 border-white/20 text-white pl-9 pr-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            {([undefined, "booking_client", "artist", "brand"] as const).map(r => (
              <button
                key={r ?? "all"}
                onClick={() => setRoleFilter(r)}
                className={`text-xs font-bold uppercase px-3 py-2 border-2 tracking-widest transition-colors ${
                  roleFilter === r ? "border-[#f97316] text-[#f97316] bg-[#f97316]/10" : "border-white/10 text-white/40 hover:border-white/30"
                }`}
              >
                {r ? ROLE_LABELS[r] : "All"}
              </button>
            ))}
          </div>
        </div>

        {clientsQ.isLoading ? (
          <div className="border-2 border-white/10 p-6 text-center text-white/30">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="border-2 border-white/10 p-8 text-center">
            <Users className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No clients found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {clients.map(c => (
              <Link key={c.id} href={`/admin/portal/client/${c.id}`}>
                <div className="border-2 border-white/10 hover:border-[#f97316]/40 p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-white/10 flex items-center justify-center flex-shrink-0 font-black text-white text-sm">
                      {(c.name || c.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm">{c.displayName || c.name}</div>
                      <div className="text-white/40 text-xs truncate">{c.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold uppercase px-2 py-1 border flex-shrink-0 ${ROLE_COLORS[c.role] || "text-white/40"}`}>
                      {ROLE_LABELS[c.role] || c.role}
                    </span>
                    <div className="text-white/20 text-xs hidden md:block">
                      {new Date(c.createdAt).toLocaleDateString("en-GB")}
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#f97316] transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
