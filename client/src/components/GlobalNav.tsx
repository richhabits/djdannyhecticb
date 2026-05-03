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

  // Desktop menu items - shown on lg+ screens
  const desktopMenuItems = [
    { href: "/mixes", label: "MIXES" },
    { href: "/live-studio", label: "LIVE" },
    { href: "/events", label: "EVENTS" },
    { href: "/bookings", label: "BOOK" },
    { href: "/press", label: "PRESS" },
    { href: "/contact", label: "CONTACT" },
  ];

  const MenuItem = ({ href, label, compact = false }: { href: string; label: string; compact?: boolean }) => (
    <Link
      href={href}
      className={`tape-strip transition-all duration-150 ${
        compact ? "px-2 py-1 text-xs" : "px-4 py-1 text-sm"
      } ${
        location === href
          ? "bg-accent text-white border-white"
          : "bg-black text-white border-white hover:bg-white hover:text-black"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-black border-b-2 border-white/20"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Main header bar */}
      <div className="flex items-center justify-between px-3 py-2 lg:px-4 lg:py-3 gap-2 lg:gap-4">
        {/* Left: Logo */}
        <Link
          href="/"
          className="tape-strip bg-white text-black border-black px-2 lg:px-3 py-1 flex items-center gap-1 text-xs lg:text-sm font-bold flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="DJ Danny Hectic B - Home"
        >
          <Zap className="w-3 h-3 fill-black" aria-hidden="true" />
          <span className="hidden sm:inline">DJ DANNY</span>
        </Link>

        {/* Center: Desktop Menu - Hidden on tablet and mobile */}
        <div className="hidden lg:flex items-center gap-1 flex-wrap">
          {desktopMenuItems.map((item) => (
            <MenuItem key={item.href} href={item.href} label={item.label} />
          ))}
        </div>

        {/* Tablet Menu - Compact version between tablet and desktop */}
        <div className="hidden md:flex lg:hidden items-center gap-1 flex-wrap justify-center flex-1">
          {desktopMenuItems.slice(0, 4).map((item) => (
            <MenuItem key={item.href} href={item.href} label={item.label} compact={true} />
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Search - Hidden on mobile, shown on tablet+ */}
          <div className="hidden sm:block">
            <GlobalSearch />
          </div>

          {/* Social icons - Hidden on mobile */}
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

          {/* Cart */}
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

          {/* Dashboard or Login */}
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="hidden sm:block tape-strip bg-white text-black border-black text-xs px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Dashboard"
            >
              DASH
            </Link>
          ) : (
            <a
              href={getLoginUrl()}
              className="hidden sm:block tape-strip bg-accent text-white border-white text-xs px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Login"
            >
              LOGIN
            </a>
          )}

          {/* Hamburger Menu - Mobile only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="md:hidden tape-strip bg-accent text-white border-white p-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
          className="fixed inset-0 top-[4.5rem] bg-black/98 z-[60] overflow-y-auto pirate-scanlines focus-trap-container"
          role="dialog"
          aria-label="Mobile navigation menu"
          aria-modal="true"
        >
          <div className="flex flex-col p-6 gap-6">
            {/* Primary Navigation */}
            <div className="flex flex-col gap-3">
              <h2 className="tape-strip bg-white text-black border-black px-3 py-1 text-sm font-bold w-fit">
                NAVIGATE
              </h2>
              <nav className="flex flex-col gap-2 pl-2">
                {desktopMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-bold text-white hover:text-accent hover:pl-1 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white uppercase"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold text-white hover:text-accent hover:pl-1 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white uppercase"
                >
                  SHOP
                </Link>
              </nav>
            </div>

            {/* Cart Section */}
            <div className="flex flex-col gap-3 border-t border-white/20 pt-4">
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-lg font-bold text-white hover:text-accent hover:pl-1 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white uppercase"
                aria-label={`Shopping cart${count > 0 ? ` - ${count} items` : ''}`}
              >
                <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                Cart
                {count > 0 && (
                  <span className="bg-accent text-black text-xs font-bold px-2 py-1">
                    {count}
                  </span>
                )}
              </Link>
            </div>

            {/* Contact Section */}
            <div className="flex flex-col gap-3 border-t border-white/20 pt-4">
              <h3 className="tape-strip bg-white text-black border-black px-3 py-1 text-sm font-bold w-fit">
                CONTACT
              </h3>
              <div className="flex flex-col gap-2 pl-2">
                <a
                  href="tel:+447957432842"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Call DJ Danny Hectic B"
                  className="flex items-center gap-2 text-white hover:text-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Phone className="w-5 h-5" aria-hidden="true" />
                  <span>+44 7957 432842</span>
                </a>
                <a
                  href="https://instagram.com/djdannyhecticb"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Follow DJ Danny Hectic B on Instagram (opens in new window)"
                  className="flex items-center gap-2 text-white hover:text-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Instagram className="w-5 h-5" aria-hidden="true" />
                  <span>@djdannyhecticb</span>
                </a>
              </div>
            </div>

            {/* Account Section */}
            <div className="flex flex-col gap-3 border-t border-white/20 pt-4 pb-6">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="tape-strip bg-white text-black border-black text-sm px-3 py-2 font-bold w-fit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  aria-label="Dashboard"
                >
                  GO TO DASHBOARD
                </Link>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="tape-strip bg-accent text-white border-white text-sm px-3 py-2 font-bold w-fit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  aria-label="Login to your account"
                >
                  LOGIN
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

