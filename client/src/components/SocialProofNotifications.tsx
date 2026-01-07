/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { X, Music, Heart, Share2, ShoppingCart, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function SocialProofNotifications() {
  const { data: notifications = [] } = trpc.socialProof.getActive.useQuery({ limit: 5 });
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  if (notifications.length === 0 || dismissed.size === notifications.length) {
    return null;
  }

  const visibleNotifications = notifications.filter(n => !dismissed.has(n.id));

  const getIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="w-4 h-4" />;
      case "purchase":
        return <ShoppingCart className="w-4 h-4" />;
      case "favorite":
        return <Heart className="w-4 h-4" />;
      case "share":
        return <Share2 className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.slice(0, 3).map((notification) => (
        <Card
          key={notification.id}
          className={cn(
            "p-4 shadow-lg animate-in slide-in-from-right",
            "bg-background border-foreground"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 text-accent">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm">
                {notification.message || (
                  <>
                    <span className="font-semibold">{notification.userName || "Someone"}</span>
                    {" "}
                    {notification.type === "booking" && "just booked a show"}
                    {notification.type === "purchase" && "just made a purchase"}
                    {notification.type === "favorite" && "liked this"}
                    {notification.type === "share" && "shared this"}
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button
              onClick={() => setDismissed(prev => new Set(prev).add(notification.id))}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

