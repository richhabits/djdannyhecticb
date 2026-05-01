import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface DonationAlertProps {
  donation: {
    id: string;
    donor: string;
    amount: number;
    message?: string;
    timestamp: Date;
  };
}

export function DonationAlert({ donation }: DonationAlertProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border border-emerald-500/50 bg-gradient-to-br from-green-600 to-emerald-700 p-2 md:p-lg lg:p-lg shadow-lg
        transition-all duration-150 pointer-events-auto min-h-[44px]
        ${isExiting ? "animate-out fade-out slide-out-to-right-full" : "animate-in fade-in slide-in-from-right-full"}
      `}
    >
      {/* Animated glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-base rounded-lg" />

      {/* Content - Responsive spacing */}
      <div className="relative z-10 space-y-1.5 md:space-y-md lg:space-y-md">
        {/* Amount - prominent, responsive size */}
        <div>
          <p className="text-2xl md:text-h1 lg:text-h1 font-extrabold text-white animate-pulse" style={{ animationDuration: "2s" }}>
            ${donation.amount.toFixed(2)}
          </p>
        </div>

        {/* Donor info */}
        <div className="space-y-1 md:space-y-sm lg:space-y-sm">
          <p className="text-xs md:text-caption lg:text-caption font-semibold text-emerald-100 truncate">
            from <span className="font-bold text-white truncate">{donation.donor}</span>
          </p>

          {/* Message - hide on mobile if long */}
          {donation.message && (
            <p className="text-xs md:text-body lg:text-body text-emerald-50 italic font-medium line-clamp-2 md:line-clamp-none">
              "{donation.message}"
            </p>
          )}

          {/* Heart animation - responsive text */}
          <div className="flex items-center gap-1 md:gap-xs lg:gap-xs pt-0.5 md:pt-xs lg:pt-xs">
            <Heart className="w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 text-emerald-200 fill-emerald-200 animate-pulse flex-shrink-0" style={{ animationDuration: "1.5s" }} />
            <span className="text-xs md:text-micro lg:text-micro text-emerald-200 truncate">Thank you!</span>
          </div>
        </div>
      </div>

      {/* Top glow accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 md:h-1 bg-gradient-to-r from-emerald-300 via-emerald-100 to-transparent opacity-60" />
    </div>
  );
}
