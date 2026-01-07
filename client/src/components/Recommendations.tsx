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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Music, Calendar, Mic2, Disc, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

interface RecommendationsProps {
  entityType: "mix" | "track" | "event" | "podcast";
  entityId: number;
  limit?: number;
}

export function Recommendations({ entityType, entityId, limit = 5 }: RecommendationsProps) {
  const { isAuthenticated } = useAuth();
  const { data: recommendations = [] } = trpc.recommendations.forEntity.useQuery(
    { entityType, entityId, limit },
    { enabled: true }
  );

  if (recommendations.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "mix":
        return <Disc className="w-4 h-4" />;
      case "track":
        return <Music className="w-4 h-4" />;
      case "event":
        return <Calendar className="w-4 h-4" />;
      case "podcast":
        return <Mic2 className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  const getUrl = (type: string, id: number) => {
    switch (type) {
      case "mix":
        return `/mixes`;
      case "track":
        return `/tracks`;
      case "event":
        return `/events`;
      case "podcast":
        return `/podcasts`;
      default:
        return "/";
    }
  };

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          You Might Also Like
        </CardTitle>
        <CardDescription>
          Based on what others are enjoying
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recommendations.map((rec, idx) => (
            <Link key={idx} href={getUrl(rec.entityType, rec.entityId)}>
              <div className="flex items-center gap-3 p-2 hover:bg-muted rounded-md transition-colors cursor-pointer">
                {getIcon(rec.entityType)}
                <div className="flex-1">
                  <p className="text-sm font-semibold capitalize">
                    {rec.entityType} #{rec.entityId}
                  </p>
                  {rec.count && (
                    <p className="text-xs text-muted-foreground">
                      {rec.count} {rec.count === 1 ? "person" : "people"} also liked this
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

