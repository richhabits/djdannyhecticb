import { useEffect, useState } from "react";
import { Users, X } from "lucide-react";

interface RaidAlertProps {
  raiderName: string;
  raidCount: number;
  onDismiss?: () => void;
  autoClose?: number; // ms
}

export function RaidAlert({
  raiderName,
  raidCount,
  onDismiss,
  autoClose = 8000,
}: RaidAlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (autoClose) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / autoClose) * 100);
        setProgress(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          setIsVisible(false);
          onDismiss?.();
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [autoClose, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="animate-slide-in-down w-full max-w-xs md:max-w-sm lg:max-w-md">
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-lg p-2 md:p-lg lg:p-lg shadow-lg hover:shadow-xl transition-all duration-base hover:scale-105 relative overflow-hidden border border-purple-500/50 min-h-[44px]">
        {/* Countdown progress bar */}
        <div
          className="absolute bottom-0 left-0 h-0.5 md:h-1 bg-white/50 transition-all duration-linear"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-start justify-between gap-2 md:gap-md lg:gap-md">
          <div className="flex items-start gap-2 md:gap-md lg:gap-md flex-1">
            <div className="w-10 h-10 md:w-14 md:h-14 lg:w-14 lg:h-14 rounded-full bg-purple-900 flex items-center justify-center flex-shrink-0 border-2 border-purple-300 text-lg md:text-2xl lg:text-2xl shadow-md">
              🪖
            </div>
            <div className="flex-1 min-w-0 pt-0.5 md:pt-xs lg:pt-xs">
              <p className="text-xs md:text-caption lg:text-caption font-bold text-purple-100 uppercase tracking-wide">Raid Incoming!</p>
              <p className="text-xs md:text-body lg:text-body font-semibold text-white mt-0.5 md:mt-xs lg:mt-xs truncate">
                <span className="font-bold text-accent-primary">{raiderName}</span>
              </p>
              <p className="text-xs md:text-body lg:text-body text-purple-100 mt-0.5 md:mt-xs lg:mt-xs">
                raided with <span className="font-extrabold md:text-h3 lg:text-h3 text-white">{raidCount.toLocaleString()}</span> viewers
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="flex-shrink-0 text-purple-200 hover:text-white transition-colors duration-base hover:scale-110 p-0.5 md:p-xs lg:p-xs min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Dismiss raid alert"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 lg:w-5 lg:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
