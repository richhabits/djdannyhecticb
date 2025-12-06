import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users, Music, Calendar, Heart } from "lucide-react";

export function SocialProofNotifications() {
  const { data: events } = trpc.socialProof.events.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  const [shownEvents, setShownEvents] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!events) return;

    events.forEach((event) => {
      if (!shownEvents.has(event.id)) {
        const icon = getEventIcon(event.eventType);
        toast.info(event.message, {
          icon,
          duration: 5000,
        });
        setShownEvents((prev) => new Set(prev).add(event.id));
      }
    });
  }, [events, shownEvents]);

  return null; // This component only shows toasts
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case "user_joined":
      return <Users className="w-4 h-4" />;
    case "mix_played":
      return <Music className="w-4 h-4" />;
    case "event_created":
      return <Calendar className="w-4 h-4" />;
    case "shout_sent":
      return <Heart className="w-4 h-4" />;
    default:
      return null;
  }
}
