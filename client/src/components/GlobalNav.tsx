import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { GlobalSearch } from "./GlobalSearch";
import { Menu, X, Zap, ShoppingCart, Phone, Instagram } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

/**
 * GlobalNav - Responsive navigation with clear mobile-first design
 *
 * Responsive Strategy:
 * - Mobile (<640px): Logo + Hamburger only
 * - Tablet (640-1024px): Logo + 4 menu items + Hamburger
 * - Desktop (1024px+): Logo + Full menu + All actions
 *
 * Fixed header heights:
 * - Mobile: 56px (sm:)
 * - Tablet: 64px (md:)
 * - Desktop: 72px (lg:)
 */
export function GlobalNav() {
  const { isAuthenticated } = useAuth();
  const { count } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  // Close menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Desktop menu items - shown on lg+ screens
  const desktopMenuItems = [
    { href: "/mixes", label: "MIXES" },
    { href: "/live-studio", label: "LIVE" },
    { href: "/events", label: "EVENTS" },
    { href: "/bookings", label: "BOOK" },
    { href: "/press", label: "PRESS" },
    { href: "/contact", label: "CONTACT" },
  ];

  // Tablet menu items - compact version for md breakpoint
  const tabletMenuItems = [
    { href: "/mixes", label: "MIXES" },
    { href: "/live-studio", label: "LIVE" },
    { href: "/events", label: "EVENTS" },
    { href: "/bookings", label: "BOOK" },
  ];

  const MenuItem = ({
    href,
    label,
    isActive = false,
    variant = "default"
  }: {
    href: string
    label: string
    isActive?: boolean
    variant?: "default" | "tablet"
  }) => {
    const baseClasses = "tape-strip transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white font-bold";
    const sizeClasses = variant === "tablet"
      ? "px-2 py-1 text-xs"
      : "px-3 py-1.5 text-sm";
    const colorClasses = isActive
      ? "bg-accent text-white border-white"
      : "bg-black text-white border-white hover:bg-white hover:text-black";

    return (
      <Link
        href={href}
        className={`${baseClasses} ${sizeClasses} ${colorClasses}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* Fixed navigation bar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-black border-b-2 border-white/20"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header container with consistent padding and height */}
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-[72px] px-3 sm:px-4 md:px-5 lg:px-6 gap-2 sm:gap-3 md:gap-4">

          {/* Left: Logo - Always visible */}
          <Link
            href="/"
            className="tape-strip bg-white text-black border-black px-2 sm:px-2.5 py-1 flex items-center gap-1 text-xs sm:text-sm font-bold flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="DJ Danny Hectic B - Home"
          >
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black" aria-hidden="true" />
            <span className="hidden sm:inline">DJ DANNY</span>
          </Link>

          {/* Center: Desktop Menu (lg+) - Hidden on tablet and mobile */}
          <div className="hidden lg:flex items-center gap-2 flex-wrap justify-center">
            {desktopMenuItems.map((item) => (
              <MenuItem
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={location === item.href}
              />
            ))}
          </div>

          {/* Center: Tablet Menu (md-lg) - 4 compact menu items */}
          <div className="hidden md:flex lg:hidden items-center gap-1.5 flex-wrap justify-center flex-1">
            {tabletMenuItems.map((item) => (
              <MenuItem
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={location === item.href}
                variant="tablet"
              />
            ))}
          </div>

          {/* Right: Actions & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-auto">

            {/* Search - Desktop+ only */}
            <div className="hidden lg:block">
              <GlobalSearch />
            </div>

            {/* Phone button - Tablet+ */}
            <a
              href="tel:+447957432842"
              aria-label="Call"
              className="hidden md:flex tape-strip bg-black text-white border-white p-2.5 hover:bg-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              title="Call us"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
            </a>

            {/* Instagram button - Tablet+ */}
            <a
              href="https://instagram.com/djdannyhecticb"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hidden md:flex tape-strip bg-black text-white border-white p-2.5 hover:bg-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              title="Follow us on Instagram"
            >
              <Instagram className="w-4 h-4" aria-hidden="true" />
            </a>

            {/* Cart - Always visible */}
            <Link
              href="/cart"
              className="relative tape-strip bg-black text-white border-white p-2.5 hover:bg-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label={`Shopping cart${count > 0 ? ` - ${count} items` : ''}`}
            >
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              {count > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-accent text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
                  aria-hidden="true"
                >
                  {count}
                </span>
              )}
            </Link>

            {/* Dashboard or Login - Tablet+ */}
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="hidden sm:block tape-strip bg-white text-black border-black text-xs px-2 sm:px-2.5 py-1 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Dashboard"
              >
                DASH
              </Link>
            ) : (
              <a
                href={getLoginUrl()}
                className="hidden sm:block tape-strip bg-accent text-white border-white text-xs px-2 sm:px-2.5 py-1 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Login"
              >
                LOGIN
              </a>
            )}

            {/* Hamburger Menu - Mobile & Tablet (md below) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className="md:hidden tape-strip bg-accent text-white border-white p-2.5 hover:bg-white hover:text-black transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white flex-shrink-0"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Menu className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Menu Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 top-14 sm:top-16 md:top-18 lg:top-[72px] bg-black/98 z-40 overflow-y-auto pirate-scanlines"
          role="dialog"
          aria-label="Mobile navigation menu"
          aria-modal="true"
        >
          <div className="flex flex-col p-4 sm:p-5 md:p-6 gap-6 max-w-2xl mx-auto" onClick={e => e.stopPropagation()}>

            {/* Primary Navigation */}
            <section className="flex flex-col gap-3">
              <h2 className="tape-strip bg-white text-black border-black px-3 py-1.5 text-sm font-bold w-fit">
                NAVIGATE
              </h2>
              <nav className="flex flex-col gap-2 pl-3">
                {desktopMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base sm:text-lg font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white uppercase ${
                      location === item.href
                        ? "text-accent"
                        : "text-white hover:text-accent hover:pl-1"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base sm:text-lg font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white uppercase ${
                    location === "/shop"
                      ? "text-accent"
                      : "text-white hover:text-accent hover:pl-1"
                  }`}
                >
                  SHOP
                </Link>
              </nav>
            </section>

            {/* Cart Section */}
            <section className="flex flex-col gap-3 border-t border-white/30 pt-4">
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-base sm:text-lg font-bold text-white hover:text-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white uppercase"
                aria-label={`Shopping cart${count > 0 ? ` - ${count} items` : ''}`}
              >
                <ShoppingCart className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span>Cart</span>
                {count > 0 && (
                  <span className="ml-auto bg-accent text-black text-xs font-bold px-2 py-1 rounded">
                    {count}
                  </span>
                )}
              </Link>
            </section>

            {/* Contact Section */}
            <section className="flex flex-col gap-3 border-t border-white/30 pt-4">
              <h3 className="tape-strip bg-white text-black border-black px-3 py-1.5 text-sm font-bold w-fit">
                CONTACT
              </h3>
              <div className="flex flex-col gap-3 pl-3">
                <a
                  href="tel:+447957432842"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Call DJ Danny Hectic B"
                  className="flex items-center gap-3 text-white hover:text-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Phone className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">+44 7957 432842</span>
                </a>
                <a
                  href="https://instagram.com/djdannyhecticb"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Follow DJ Danny Hectic B on Instagram (opens in new window)"
                  className="flex items-center gap-3 text-white hover:text-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Instagram className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">@djdannyhecticb</span>
                </a>
              </div>
            </section>

            {/* Account Section */}
            <section className="flex flex-col gap-3 border-t border-white/30 pt-4 pb-6">
              <h3 className="tape-strip bg-white text-black border-black px-3 py-1.5 text-sm font-bold w-fit">
                ACCOUNT
              </h3>
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
            </section>
          </div>
        </div>
      )}
    </>
  );
}

