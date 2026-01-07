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
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Radio, Play, Calendar } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";
import { format } from "date-fns";

export default function ShowPage() {
  const { data: shows } = trpc.showsPhase9.listPublic.useQuery();
  const { data: currentLive } = trpc.live.getCurrentLive.useQuery();
  const { data: episodes } = trpc.episodes.listByShow.useQuery(
    { limit: 1 },
    { enabled: !!shows?.[0]?.id }
  );

  const primaryShow = shows?.find((s) => s.isPrimaryShow) || shows?.[0];
  const lastEpisode = episodes?.[0];

  return (
    <>
      <MetaTagsComponent
        title="The Hectic Show - DJ Danny Hectic B"
        description="Watch and listen to The Hectic Show episodes"
        url="/show"
      />
      <div className="container mx-auto p-6">
        {primaryShow ? (
          <>
            {/* Hero Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="h-8 w-8" />
                <h1 className="text-4xl font-bold">{primaryShow.name}</h1>
              </div>
              {currentLive && (
                <div className="mb-4">
                  <Badge variant="destructive" className="mb-2">
                    ON AIR
                  </Badge>
                  <p className="text-lg">Live now! Tune in below.</p>
                  <Link href="/live">
                    <Button className="mt-2">
                      <Play className="h-4 w-4 mr-2" />
                      Go Live
                    </Button>
                  </Link>
                </div>
              )}
              <p className="text-muted-foreground text-lg">{primaryShow.description}</p>
            </div>

            {/* Last Episode */}
            {lastEpisode && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Latest Episode</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{lastEpisode.title}</h3>
                      {lastEpisode.description && (
                        <p className="text-muted-foreground mb-4">{lastEpisode.description}</p>
                      )}
                      {lastEpisode.publishedAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(lastEpisode.publishedAt), "MMMM d, yyyy")}
                        </div>
                      )}
                    </div>
                    <Link href={`/show/episode/${lastEpisode.slug}`}>
                      <Button>View Episode</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <div className="text-center">
              <Link href="/show/episodes">
                <Button variant="outline" size="lg">
                  See All Episodes
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>No shows available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

