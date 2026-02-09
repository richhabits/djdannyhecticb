import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { GlobalSearch } from "./GlobalSearch";
import { Menu, X, Zap } from "lucide-react";

export function GlobalNav() {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const MenuItem = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={`tape-strip px-6 py-1 mx-1 transition-all duration-0 ${location === href
        ? "bg-accent text-white border-white"
        : "bg-black text-white border-white hover:bg-white hover:text-black"
        }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-center pointer-events-none px-4">
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="md:hidden">
          {!mobileMenuOpen ? (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="tape-strip bg-accent text-white border-white p-2"
            >
              <Menu className="w-6 h-6" />
            </button>
          ) : null}
        </div>

        <Link href="/" className="tape-strip bg-white text-black border-black px-4 flex items-center gap-2">
          <Zap className="w-4 h-4 fill-black" />
          <span>DJ Danny Hectic B</span>
        </Link>

        <div className="hidden md:flex items-center">
          <MenuItem href="/mixes" label="MIXES" />
          <MenuItem href="/live-studio" label="LIVE" />
          <MenuItem href="/events" label="EVENTS" />
          <MenuItem href="/bookings" label="BOOKINGS" />
          <MenuItem href="/press" label="PRESS" />
          <MenuItem href="/contact" label="CONTACT" />

          <div className="ml-4 flex items-center gap-2">
            <GlobalSearch />
            {isAuthenticated ? (
              <Link href="/dashboard" className="tape-strip bg-white text-black border-black text-xs">DASHBOARD</Link>
            ) : (
              <a href={getLoginUrl()} className="tape-strip bg-accent text-white border-white text-xs">LOGIN</a>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col p-8 pirate-scanlines">
          <div className="flex justify-between items-center mb-16">
            <div className="tape-strip bg-white text-black border-black text-2xl">MENU</div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="tape-strip bg-accent text-white"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
          <div className="flex flex-col gap-4 text-4xl font-black uppercase tracking-tighter">
            <Link href="/mixes" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent">Archive</Link>
            <Link href="/live-studio" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent">Live Studio</Link>
            <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent">Events</Link>
            <Link href="/bookings" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent">Bookings</Link>
            <Link href="/press" onClick={() => setMobileMenuOpen(false)} className="hover:text-accent">Press Kit</Link>
            {!isAuthenticated && <a href={getLoginUrl()} className="text-accent underline">Login</a>}
          </div>
        </div>
      )}
    </nav>
  );
}

