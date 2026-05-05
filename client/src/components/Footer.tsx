import { Mail, Phone, Instagram } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t-4 border-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 md:gap-16">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="tape-strip bg-white text-black border-black inline-block px-3 py-2 text-sm font-bold">
              HECTIC EMPIRE
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold uppercase tracking-wide text-white/80">
                Professional Audio Distribution
              </p>
              <p className="text-xs text-white/60 leading-relaxed">
                Clubs • Festivals • Radio • Private Events
              </p>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="space-y-4">
            <h3 className="tape-strip bg-white text-black border-black inline-block px-3 py-2 text-sm font-bold">
              NAVIGATE
            </h3>
            <nav className="flex flex-col gap-3">
              <Link href="/mixes" className="text-sm font-bold uppercase hover:text-accent transition-colors">
                Mixes
              </Link>
              <Link href="/events" className="text-sm font-bold uppercase hover:text-accent transition-colors">
                Events
              </Link>
              <Link href="/bookings" className="text-sm font-bold uppercase hover:text-accent transition-colors">
                Bookings
              </Link>
              <Link href="/shop" className="text-sm font-bold uppercase hover:text-accent transition-colors">
                Shop
              </Link>
            </nav>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="tape-strip bg-white text-black border-black inline-block px-3 py-2 text-sm font-bold">
              CONTACT
            </h3>
            <div className="space-y-3">
              <a
                href="tel:+447957432842"
                className="flex items-center gap-3 text-sm font-bold uppercase hover:text-accent transition-colors group"
              >
                <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>+44 7957 432842</span>
              </a>
              <a
                href="mailto:contact@djdannyhectic.com"
                className="flex items-center gap-3 text-sm font-bold uppercase hover:text-accent transition-colors group"
              >
                <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>Contact</span>
              </a>
              <a
                href="https://instagram.com/djdannyhecticb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm font-bold uppercase hover:text-accent transition-colors group"
              >
                <Instagram className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>@djdannyhecticb</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-white/20 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase text-white/60">
            <p>© {currentYear} DJ DANNY HECTIC B</p>
            <p>Hectic Radio | Hectic Empire</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
