import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";

interface SubscriberAlertProps {
  subscriberName: string;
  tier?: "bronze" | "silver" | "gold" | "platinum";
  months?: number;
  message?: string;
  onDismiss?: () => void;
  autoClose?: number;
}

const tierColors = {
  bronze: "from-amber-600 to-amber-700 border-amber-400",
  silver: "from-gray-400 to-gray-500 border-gray-300",
  gold: "from-yellow-500 to-yellow-600 border-yellow-300",
  platinum: "from-cyan-500 to-blue-600 border-cyan-300",
};

const tierIcons = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  platinum: "👑",
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
    <div className="animate-slide-in-down fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
      <div
        className={`bg-gradient-to-r ${tierColors[tier]} rounded-lg p-4 shadow-2xl border-2`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-3xl flex-shrink-0">
              {tierIcons[tier]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">NEW SUBSCRIBER!</p>
              <p className="text-white text-sm font-semibold">
                {subscriberName} subscribed for {months} month{months > 1 ? "s" : ""}
              </p>
              {message && (
                <p className="text-white/90 text-xs mt-1 italic">"{message}"</p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="flex-shrink-0 text-white hover:opacity-75 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
