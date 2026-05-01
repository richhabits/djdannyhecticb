import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface SubscriberAlertProps {
  subscriberName: string;
  tier?: "bronze" | "silver" | "gold" | "platinum";
  months?: number;
  message?: string;
  onDismiss?: () => void;
  autoClose?: number;
}

const tierConfig = {
  bronze: {
    gradient: "from-orange-700 to-amber-900",
    icon: "🥉",
    label: "Bronze",
    brightness: "hover:brightness-110",
  },
  silver: {
    gradient: "from-gray-600 to-slate-800",
    icon: "🥈",
    label: "Silver",
    brightness: "hover:brightness-110",
  },
  gold: {
    gradient: "from-yellow-600 to-amber-800",
    icon: "🥇",
    label: "Gold",
    brightness: "hover:brightness-110",
  },
  platinum: {
    gradient: "from-violet-700 to-purple-900",
    icon: "👑",
    label: "Platinum",
    brightness: "hover:brightness-110",
  },
};

export function SubscriberAlert({
  subscriberName,
  tier = "gold",
  months = 1,
  message,
  onDismiss,
  autoClose = 7000,
}: SubscriberAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = tierConfig[tier];

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="animate-slide-in-down w-full max-w-xs md:max-w-sm lg:max-w-md">
      <div
        className={`bg-gradient-to-br ${config.gradient} rounded-lg p-2 md:p-lg lg:p-lg shadow-lg transition-all duration-base ${config.brightness} border-2 border-white/20 min-h-[44px]`}
      >
        <div className="flex items-start justify-between gap-2 md:gap-md lg:gap-md">
          <div className="flex items-start gap-2 md:gap-md lg:gap-md flex-1">
            <div className="text-lg md:text-2xl lg:text-2xl flex-shrink-0 animate-bounce" style={{ animationDelay: "0s" }}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0 pt-0.5 md:pt-xs lg:pt-xs">
              <p className="text-xs md:text-caption lg:text-caption font-bold text-white/80 uppercase tracking-wide">New Subscriber!</p>
              <p className="text-xs md:text-body lg:text-body font-extrabold text-white mt-0.5 md:mt-xs lg:mt-xs truncate">
                {subscriberName}
              </p>
              <p className="text-xs md:text-caption lg:text-caption text-white/90 font-semibold mt-0.5 md:mt-xs lg:mt-xs">
                {months} {months === 1 ? "month" : "months"} of {config.label}
              </p>
              {message && (
                <p className="text-xs md:text-caption lg:text-caption text-white/80 mt-1 md:mt-md lg:mt-md italic font-medium line-clamp-2 md:line-clamp-none">"{message}"</p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors duration-base hover:scale-110 p-0.5 md:p-xs lg:p-xs min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Dismiss subscriber alert"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 lg:w-5 lg:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
