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
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border border-[#FF4444]/30 bg-gradient-to-r from-[#FF4444]/20 to-[#FF4444]/10 p-4 backdrop-blur-sm
        animate-in transition-all duration-300 pointer-events-auto
        ${isExiting ? "animate-out fade-out slide-out-to-right-full" : "animate-in fade-in slide-in-from-right-full"}
      `}
    >
      {/* Animated pulse background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF4444] to-transparent opacity-0 animate-pulse" />

      {/* Content */}
      <div className="relative z-10 flex items-start gap-3">
        {/* Heart Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-[#FF4444] flex items-center justify-center animate-bounce">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#FF4444]">
            {donation.donor} donated!
          </p>
          <p className="text-xs text-white/90">
            <span className="font-bold text-[#FF4444]">
              ${donation.amount.toLocaleString()}
            </span>
            {donation.message && (
              <>
                <span className="text-white/60"> • </span>
                <span className="text-white/80">"{donation.message}"</span>
              </>
            )}
          </p>
        </div>

        {/* Amount Badge */}
        <div className="flex-shrink-0 text-right">
          <p className="text-lg font-black text-[#FF4444]">
            ${donation.amount}
          </p>
        </div>
      </div>

      {/* Animated border */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF4444] to-transparent animate-pulse" />
    </div>
  );
}
