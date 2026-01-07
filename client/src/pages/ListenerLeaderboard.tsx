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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SocialShareBar } from "@/components/SocialShareBar";
import { MetaTagsComponent } from "@/components/MetaTags";
import { trpc } from "@/lib/trpc";
import { Trophy, Users } from "lucide-react";

function getListenerLevel(totalShouts: number): { level: number; label: string; variant: "default" | "secondary" | "outline" } {
  if (totalShouts >= 6) {
    return { level: 3, label: "Day One Hectic", variant: "default" };
  }
  if (totalShouts >= 3) {
    return { level: 2, label: "Regular", variant: "secondary" };
  }
  return { level: 1, label: "New Listener", variant: "outline" };
}

export default function ListenerLeaderboard() {
  const { data: listeners, isLoading } = trpc.listeners.leaderboard.useQuery({ limit: 20 });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-8 px-4">
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaTagsComponent
        title="Listener Leaderboard | Hectic Radio"
        description="Top listeners on Hectic Radio - the most locked in fans! See who's leading the pack."
        url="/listeners"
      />
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-8 px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 gradient-text flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              Listener Leaderboard
            </h1>
            <p className="text-muted-foreground mb-4">
              Top listeners on Hectic Radio - the most locked in fans!
            </p>
            <SocialShareBar
              url="/listeners"
              title="Hectic Radio Listener Leaderboard"
              description="Check out the top listeners on Hectic Radio!"
              className="mb-4"
            />
          </div>

        {!listeners || listeners.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No listeners yet. Be the first to send a shout!</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top {listeners.length} Listeners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-right">Total Shouts</TableHead>
                    <TableHead>First Seen</TableHead>
                    <TableHead>Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listeners.map((listener, index) => {
                    const { label, variant } = getListenerLevel(listener.totalShouts);
                    return (
                      <TableRow key={listener.name}>
                        <TableCell className="font-bold">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                        </TableCell>
                        <TableCell className="font-medium">{listener.displayName}</TableCell>
                        <TableCell>
                          <Badge variant={variant}>{label}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-accent">
                          {listener.totalShouts}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(listener.firstSeen).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(listener.lastSeen).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </>
  );
}

