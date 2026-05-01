import { Heart, Users, Gift, Zap } from "lucide-react";

interface StreamEvent {
  id: string;
  type: "follow" | "subscribe" | "donation" | "raid";
  username: string;
  timestamp: Date;
  details?: string;
  amount?: number;
}

interface StreamEventLogProps {
  events?: StreamEvent[];
  maxVisible?: number;
}

const eventConfig = {
  follow: { icon: Users, color: "text-blue-400", accent: "border-blue-500/50", bg: "hover:bg-blue-500/10" },
  subscribe: { icon: Gift, color: "text-amber-400", accent: "border-amber-500/50", bg: "hover:bg-amber-500/10" },
  donation: { icon: Heart, color: "text-red-400", accent: "border-red-500/50", bg: "hover:bg-red-500/10" },
  raid: { icon: Zap, color: "text-purple-400", accent: "border-purple-500/50", bg: "hover:bg-purple-500/10" },
};

export function StreamEventLog({
  events = [
    { id: "1", type: "follow", username: "CoolDude42", timestamp: new Date(Date.now() - 30000) },
    { id: "2", type: "subscribe", username: "VibeChecker", timestamp: new Date(Date.now() - 60000) },
    { id: "3", type: "donation", username: "TopSupporter", timestamp: new Date(Date.now() - 90000), amount: 25 },
    { id: "4", type: "raid", username: "RadStreamer", timestamp: new Date(Date.now() - 120000), details: "Raided with 500 viewers" },
  ],
  maxVisible = 5,
}: StreamEventLogProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="stream-event-log bg-dark-surface rounded-lg border border-border-primary p-2 md:p-md lg:p-lg space-y-2 md:space-y-md">
      <h4 className="text-xs md:text-caption lg:text-sm font-bold text-white uppercase tracking-wider">Activity Feed</h4>

      {/* Responsive height: shorter on mobile to prevent content push */}
      <div className="space-y-1 md:space-y-sm lg:space-y-sm max-h-40 md:max-h-64 lg:max-h-80 overflow-y-auto border-l-2 border-accent-primary pl-2 md:pl-md lg:pl-lg">
        {events.slice(0, maxVisible).map((event) => {
          const config = eventConfig[event.type];
          const Icon = config.icon;

          return (
            <div
              key={event.id}
              className={`flex items-start gap-1.5 md:gap-sm lg:gap-sm p-1 md:p-xs lg:p-xs rounded transition-colors duration-base ${config.bg} group cursor-pointer min-h-[44px]`}
            >
              <Icon className={`w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4 flex-shrink-0 mt-0.5 md:mt-xs lg:mt-xs ${config.color} transition-transform duration-base group-hover:scale-110`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 md:gap-sm lg:gap-sm">
                  <span className="text-xs md:text-caption lg:text-caption font-semibold text-white truncate group-hover:text-accent-primary transition-colors duration-base">
                    {event.username}
                  </span>
                  <span className="text-xs md:text-micro lg:text-micro text-text-secondary flex-shrink-0 whitespace-nowrap">
                    {formatTime(event.timestamp)}
                  </span>
                </div>
                <p className="text-xs md:text-micro lg:text-micro text-text-tertiary mt-0.5 md:mt-xs lg:mt-xs font-medium">
                  {event.type === "donation" && event.amount && (
                    <>Donated ${event.amount.toFixed(2)}</>
                  )}
                  {event.type === "subscribe" && <>Subscribed</>}
                  {event.type === "follow" && <>Followed</>}
                  {event.type === "raid" && (
                    <>
                      Raided
                      <span className="hidden md:inline"> with {event.details}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
