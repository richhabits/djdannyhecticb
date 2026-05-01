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
    <div className="animate-slide-in-down fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 shadow-2xl border border-purple-400">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center flex-shrink-0 border-2 border-purple-300">
              <Users className="w-6 h-6 text-purple-200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">RAID INCOMING!</p>
              <p className="text-purple-100 text-sm">
                <span className="font-bold">{raiderName}</span> raided with{" "}
                <span className="font-bold text-lg">{raidCount.toLocaleString()}</span> viewers
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss?.();
            }}
            className="flex-shrink-0 text-purple-100 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
