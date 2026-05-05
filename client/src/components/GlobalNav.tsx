import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

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

  const menuItems = [
    { href: "/mixes", label: "MIXES" },
    { href: "/live-studio", label: "LIVE" },
    { href: "/events", label: "EVENTS" },
    { href: "/bookings", label: "BOOK" },
    { href: "/press", label: "PRESS" },
    { href: "/contact", label: "CONTACT" },
  ];

  const shopItem = { href: "/shop", label: "SHOP" };

  const MenuItem = ({
    href,
    label,
    isActive = false,
  }: {
    href: string
    label: string
    isActive?: boolean
  }) => {
    const baseClasses = "tape-strip px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-xs md:text-sm lg:text-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white font-bold min-h-[44px] flex items-center justify-center";
    const colorClasses = isActive
      ? "bg-accent text-white border-white"
      : "bg-black text-white border-white hover:bg-white hover:text-black";

    return (
      <Link
        href={href}
        className={`${baseClasses} ${colorClasses}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* Fixed navigation bar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-black border-b-2 border-white/40 shadow-lg"
        role="navigation"
        aria-label="Main navigation"
        style={{ boxShadow: '0 2px 0 rgba(249, 115, 22, 0.1)' }}
      >
        {/* Header container with consistent padding and height */}
        <div className="flex items-center justify-between h-16 sm:h-20 md:h-20 lg:h-20 px-4 sm:px-6 md:px-8 lg:px-8 gap-3 sm:gap-4 md:gap-6">

          {/* Left: Logo - Always visible */}
          <Link
            href="/"
            className="flex items-center gap-1 sm:gap-2 font-bold flex-shrink-0 text-white hover:text-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white py-2 px-1 sm:px-2 min-h-[44px] min-w-[44px] justify-center sm:justify-start"
            aria-label="DJ Danny Hectic B - Home"
          >
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white flex-shrink-0" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-bold">
              <span className="sm:hidden">DJ</span>
              <span className="hidden sm:inline">DJ DANNY</span>
            </span>
          </Link>

          {/* Center: Desktop Menu (lg+) - All 6 items */}
          <div className="hidden lg:flex items-center gap-1 flex-wrap justify-center">
            {menuItems.map((item) => (
              <MenuItem
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={location === item.href}
              />
            ))}
          </div>

          {/* Center: Tablet Menu (md-lg) - 6 items in 2 rows */}
          <div className="hidden md:flex lg:hidden items-center gap-1 flex-wrap justify-center flex-1">
            {menuItems.map((item) => (
              <MenuItem
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={location === item.href}
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
              className="hidden md:flex items-center justify-center tape-strip bg-black text-white border-white p-3 hover:bg-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-w-[44px] min-h-[44px]"
              title="Call us"
            >
              <Phone className="w-5 h-5" aria-hidden="true" />
            </a>

            {/* Instagram button - Tablet+ */}
            <a
              href="https://instagram.com/djdannyhecticb"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hidden md:flex items-center justify-center tape-strip bg-black text-white border-white p-3 hover:bg-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-w-[44px] min-h-[44px]"
              title="Follow us on Instagram"
            >
              <Instagram className="w-5 h-5" aria-hidden="true" />
            </a>

            {/* Cart - Always visible */}
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center tape-strip bg-black text-white border-white p-3 hover:bg-accent transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-w-[44px] min-h-[44px]"
              aria-label={`Shopping cart${count > 0 ? ` - ${count} items` : ''}`}
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              {count > 0 && (
                <span
                  className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-accent text-black text-xs font-bold w-6 h-6 flex items-center justify-center border-2 border-black"
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
                className="hidden sm:flex items-center justify-center tape-strip bg-white text-black border-black text-xs px-3 sm:px-3.5 py-2 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-h-[44px]"
                aria-label="Dashboard"
              >
                DASH
              </Link>
            ) : (
              <a
                href={getLoginUrl()}
                className="hidden sm:flex items-center justify-center tape-strip bg-accent text-white border-white text-xs px-3 sm:px-3.5 py-2 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-h-[44px]"
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
              className="md:hidden tape-strip bg-accent text-white border-white p-3 hover:bg-white hover:text-black transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
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
          className="fixed inset-0 top-16 sm:top-20 md:top-20 lg:top-20 bg-black/98 z-40 overflow-y-auto pirate-scanlines"
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
                {menuItems.map((item) => (
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
                  href={shopItem.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base sm:text-lg font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white uppercase ${
                    location === shopItem.href
                      ? "text-accent"
                      : "text-white hover:text-accent hover:pl-1"
                  }`}
                >
                  {shopItem.label}
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

