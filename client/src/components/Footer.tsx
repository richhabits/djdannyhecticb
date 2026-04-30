import { Phone, Instagram, Mail } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t border-white mt-16">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand Info */}
          <div>
            <h3 className="font-black text-xl mb-4 tape-strip inline-block bg-accent text-black px-3 py-1">
              DJ DANNY HECTIC B
            </h3>
            <p className="text-gray-300 text-sm mt-4">
              Hectic Radio | Archive | Bookings
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-bold mb-4 text-accent">NAVIGATION</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/mixes" className="text-gray-300 hover:text-white">
                  Archive & Mixes
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-gray-300 hover:text-white">
                  Bookings
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-300 hover:text-white">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-gray-300 hover:text-white">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4 text-accent">CONTACT</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                <a href="tel:+447957432842" className="text-gray-300 hover:text-white">
                  07957 432842
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-accent" />
                <a
                  href="https://instagram.com/djdannyhecticb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  @djdannyhecticb
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                <a href="mailto:contact@djdannyhectic.com" className="text-gray-300 hover:text-white">
                  contact@djdannyhectic.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 text-center text-xs text-gray-400">
          <p>&copy; {currentYear} DJ Danny Hectic B. All rights reserved.</p>
          <p className="mt-2">Hectic Radio | Powered by Hectic Empire</p>
        </div>
      </div>
    </footer>
  );
}
