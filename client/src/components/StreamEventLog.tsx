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
  follow: { icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
  subscribe: { icon: Gift, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  donation: { icon: Heart, color: "text-red-400", bg: "bg-red-500/10" },
  raid: { icon: Zap, color: "text-purple-400", bg: "bg-purple-500/10" },
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
    <div className="bg-[#0A0A0A] rounded-lg border border-[#333333] p-3 space-y-2">
      <h4 className="text-xs font-bold text-white mb-3">ACTIVITY FEED</h4>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {events.slice(0, maxVisible).map((event) => {
          const config = eventConfig[event.type];
          const Icon = config.icon;

          return (
            <div
              key={event.id}
              className={`flex items-start gap-2 p-2 rounded text-xs ${config.bg}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white font-bold truncate">{event.username}</span>
                  <span className="text-[#999999] flex-shrink-0 text-xs">
                    {formatTime(event.timestamp)}
                  </span>
                </div>
                <p className="text-[#999999] text-xs mt-0.5 capitalize">
                  {event.type === "donation" && event.amount && (
                    <>Donated ${event.amount}</>
                  )}
                  {event.type === "subscribe" && <>Subscribed</>}
                  {event.type === "follow" && <>Followed</>}
                  {event.type === "raid" && <>Raided - {event.details}</>}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
