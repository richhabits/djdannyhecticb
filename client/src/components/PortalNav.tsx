import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/bookings", label: "Bookings" },
  { href: "/portal/media", label: "Media Library" },
  { href: "/portal/playlists", label: "Playlists" },
  { href: "/portal/profile", label: "Profile" },
];

export function PortalNav() {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="border-b border-border mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4">
        <nav className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <Link key={tab.href} href={tab.href}>
              <span
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold smooth-transition cursor-pointer",
                  location === tab.href
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white"
                    : "glass hover:opacity-80"
                )}
              >
                {tab.label}
              </span>
            </Link>
          ))}
        </nav>
        <Button variant="outline" size="sm" onClick={() => logout()}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
