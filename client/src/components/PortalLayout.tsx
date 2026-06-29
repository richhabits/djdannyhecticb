import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import {
  LayoutDashboard, Calendar, FolderOpen, User, Zap, LogOut, ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/portal/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/portal/bookings", label: "Bookings", icon: <Calendar className="w-4 h-4" /> },
  { href: "/portal/media", label: "Media Library", icon: <FolderOpen className="w-4 h-4" /> },
  { href: "/portal/profile", label: "My Profile", icon: <User className="w-4 h-4" /> },
];

const ROLE_LABELS: Record<string, string> = {
  booking_client: "Booking Client",
  artist: "Artist",
  brand: "Brand",
  admin: "Admin",
};

export function PortalLayout({ children, title }: { children: ReactNode; title?: string }) {
  const { user, logout } = usePortalAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-black">
      {/* Top bar */}
      <div className="border-b-2 border-white/10 bg-black px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[#f97316] hover:text-orange-400 transition-colors">
            <Zap className="w-5 h-5 fill-[#f97316]" />
          </Link>
          <span className="text-white/20 text-sm">|</span>
          <span className="text-white text-sm font-bold uppercase tracking-widest">Client Portal</span>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-white text-sm font-bold leading-none">{user.name}</div>
              <div className="text-[#f97316] text-xs uppercase tracking-widest mt-0.5">
                {ROLE_LABELS[user.role] || user.role}
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="text-white/40 hover:text-white transition-colors p-1"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex min-h-[calc(100vh-57px)]">
        {/* Sidebar */}
        <aside className="w-52 border-r-2 border-white/10 flex-shrink-0 hidden md:block">
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map(item => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold uppercase tracking-widest transition-colors group ${
                    isActive
                      ? "bg-[#f97316] text-black"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className={isActive ? "text-black" : "text-white/40 group-hover:text-white transition-colors"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 max-w-5xl">
          {title && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
                <span>Portal</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white/60">{title}</span>
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h1>
              <div className="h-0.5 w-12 bg-[#f97316] mt-2" />
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t-2 border-white/10 bg-black flex md:hidden z-40">
        {NAV_ITEMS.map(item => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-widest ${
                isActive ? "text-[#f97316]" : "text-white/40"
              }`}
            >
              {item.icon}
              {item.label.split(" ")[0]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
