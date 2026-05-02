import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { GlobalSearch } from "./GlobalSearch";
import { Menu, X, Zap, ShoppingCart, Phone, Instagram } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export function GlobalNav() {
  const { isAuthenticated } = useAuth();
  const { count } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const MenuItem = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={`tape-strip px-4 py-1 text-sm transition-all duration-150 ${location === href
        ? "bg-accent text-white border-white"
        : "bg-black text-white border-white hover:bg-white hover:text-black"
        }`}
    >
      {label}
    </Link>
  );

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-black border-b-2 border-white/20 px-4 py-3"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Left: Logo */}
      <Link
        href="/"
        className="tape-strip bg-white text-black border-black px-3 py-1 flex items-center gap-1 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="DJ Danny Hectic B - Home"
      >
        <Zap className="w-3 h-3 fill-black" aria-hidden="true" />
        <span className="hidden sm:inline">DJ DANNY</span>
      </Link>

      {/* Center: Desktop Menu */}
      <div className="hidden md:flex items-center gap-1">
        <MenuItem href="/mixes" label="MIXES" />
        <MenuItem href="/live-studio" label="LIVE" />
        <MenuItem href="/events" label="EVENTS" />
        <MenuItem href="/bookings" label="BOOKINGS" />
        <MenuItem href="/press" label="PRESS" />
        <MenuItem href="/contact" label="CONTACT" />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <GlobalSearch />
        <a
          href="tel:+447957432842"
          aria-label="Call"
          className="hidden sm:flex tape-strip bg-black text-white border-white p-1.5 hover:bg-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Phone className="w-4 h-4" aria-hidden="true" />
        </a>
        <a
          href="https://instagram.com/djdannyhecticb"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="hidden sm:flex tape-strip bg-black text-white border-white p-1.5 hover:bg-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Instagram className="w-4 h-4" aria-hidden="true" />
        </a>
        <Link
          href="/cart"
          className="relative tape-strip bg-black text-white border-white p-1.5 hover:bg-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={`Cart${count > 0 ? ` - ${count}` : ''}`}
        >
          <ShoppingCart className="w-4 h-4" aria-hidden="true" />
          {count > 0 && (
            <span
              className="absolute -top-1 -right-1 bg-accent text-black text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full"
              aria-hidden="true"
            >
              {count}
            </span>
          )}
        </Link>
        {isAuthenticated ? (
          <Link
            href="/dashboard"
            className="tape-strip bg-white text-black border-black text-xs px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Dashboard"
          >
            DASH
          </Link>
        ) : (
          <a
            href={getLoginUrl()}
            className="tape-strip bg-accent text-white border-white text-xs px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Login"
          >
            LOGIN
          </a>
        )}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="tape-strip bg-accent text-white border-white p-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Menu className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 bg-black/95 z-[60] flex flex-col p-8 pirate-scanlines focus-trap-container"
          role="dialog"
          aria-label="Mobile navigation menu"
          aria-modal="true"
        >
          <div className="flex justify-between items-center mb-16">
            <div className="tape-strip bg-white text-black border-black text-2xl">MENU</div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="tape-strip bg-accent text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X className="w-8 h-8" aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-col gap-4 text-4xl font-black uppercase tracking-tighter">
            <Link
              href="/mixes"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Archive
            </Link>
            <Link
              href="/live-studio"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Live Studio
            </Link>
            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Events
            </Link>
            <Link
              href="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Bookings
            </Link>
            <Link
              href="/press"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Press Kit
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Contact
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Shop
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-accent flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label={`Shopping cart${count > 0 ? ` - ${count} items` : ''}`}
            >
              Cart {count > 0 && <span className="text-sm bg-accent text-black px-2 py-1 rounded">({count})</span>}
            </Link>
            <div className="flex gap-4 mt-4">
              <a
                href="tel:+447957432842"
                aria-label="Call DJ Danny Hectic B"
                className="text-accent text-2xl hover:text-white flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Phone className="w-6 h-6" aria-hidden="true" /> Call
              </a>
              <a
                href="https://instagram.com/djdannyhecticb"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow DJ Danny Hectic B on Instagram (opens in new window)"
                className="text-accent text-2xl hover:text-white flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Instagram className="w-6 h-6" aria-hidden="true" /> Follow
              </a>
            </div>
            {!isAuthenticated && (
              <a
                href={getLoginUrl()}
                className="text-accent underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Login to your account"
              >
                Login
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

