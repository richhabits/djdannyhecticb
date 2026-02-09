import { useState, useEffect } from "react";
import { Headphones } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function LockedInCounter() {
  const { data: shouts } = trpc.shouts.list.useQuery({ limit: 100 }, { retry: false });
  
  // Base count + number of approved shouts (simple implementation)
  // TODO: Replace with real analytics when available
  const baseCount = 42;
  const shoutCount = shouts?.length || 0;
  const [sessionCount, setSessionCount] = useState(0);
  
  useEffect(() => {
    // Increment session count when shouts are loaded (simple session tracking)
    if (shouts && shouts.length > 0) {
      const stored = sessionStorage.getItem("hectic-session-count");
      const current = stored ? parseInt(stored, 10) : 0;
      if (current < shoutCount) {
        setSessionCount(shoutCount - current);
        sessionStorage.setItem("hectic-session-count", shoutCount.toString());
      }
    }
  }, [shouts, shoutCount]);
  
  const totalCount = baseCount + shoutCount + sessionCount;
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-accent/50">
      <Headphones className="w-5 h-5 text-accent" />
      <span className="text-sm font-semibold">
        <span className="text-accent">{totalCount}</span>{" "}
        <span className="text-muted-foreground">Hectic Heads locked in right now</span>
      </span>
    </div>
  );
}

