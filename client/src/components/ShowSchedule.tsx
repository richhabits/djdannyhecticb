/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getNextShow(shows: Array<{ dayOfWeek: number; startTime: string; name: string; host: string | null }>) {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Find next show
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const checkDay = (currentDay + dayOffset) % 7;
    const dayShows = shows.filter((s) => s.dayOfWeek === checkDay);
    
    for (const show of dayShows) {
      const [hours, minutes] = show.startTime.split(":").map(Number);
      const showTime = hours * 60 + minutes;
      
      if (dayOffset === 0 && showTime > currentTime) {
        return { show, dayOffset: 0 };
      }
      if (dayOffset > 0) {
        return { show, dayOffset };
      }
    }
  }
  
  return null;
}

function Countdown({ targetTime }: { targetTime: Date }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return <span className="font-mono font-bold text-accent">{timeLeft}</span>;
}

export function ShowSchedule() {
  const { data: shows, isLoading } = trpc.shows.list.useQuery();

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-2xl font-bold gradient-text">
            This Week on Hectic Radio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading schedule...</p>
        </CardContent>
      </Card>
    );
  }

  if (!shows || shows.length === 0) {
    return null;
  }

  // Group shows by day
  const showsByDay = new Map<number, typeof shows>();
  for (const show of shows) {
    if (!showsByDay.has(show.dayOfWeek)) {
      showsByDay.set(show.dayOfWeek, []);
    }
    showsByDay.get(show.dayOfWeek)!.push(show);
  }

  const nextShowInfo = getNextShow(shows);
  let nextShowTime: Date | null = null;
  if (nextShowInfo) {
    const now = new Date();
    const targetDay = new Date(now);
    targetDay.setDate(now.getDate() + nextShowInfo.dayOffset);
    const [hours, minutes] = nextShowInfo.show.startTime.split(":").map(Number);
    targetDay.setHours(hours, minutes, 0, 0);
    nextShowTime = targetDay;
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          This Week on Hectic Radio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Next Show Countdown */}
        {nextShowInfo && nextShowTime && (
          <div className="p-4 rounded-lg border border-accent/50 bg-accent/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold">Next up:</span>
            </div>
            <p className="font-bold text-lg mb-1">
              {nextShowInfo.show.name}
              {nextShowInfo.show.host && ` with ${nextShowInfo.show.host}`}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Starts in: <Countdown targetTime={nextShowTime} />
            </p>
          </div>
        )}

        {/* Schedule by Day */}
        {Array.from(showsByDay.entries())
          .sort(([a], [b]) => a - b)
          .map(([day, dayShows]) => (
            <div key={day}>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {DAYS[day]}
              </h3>
              <div className="space-y-2">
                {dayShows.map((show) => (
                  <div
                    key={show.id}
                    className="p-3 rounded-lg border border-border bg-card/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold">{show.name}</p>
                        {show.host && (
                          <p className="text-sm text-muted-foreground">Host: {show.host}</p>
                        )}
                        {show.description && (
                          <p className="text-sm text-muted-foreground mt-1">{show.description}</p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground shrink-0">
                        {show.startTime} - {show.endTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

