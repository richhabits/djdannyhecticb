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
import { trpc } from "@/lib/trpc";
import { useRoute } from "wouter";
import { Calendar, Play } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";
import { format } from "date-fns";

export default function ShowEpisodeDetail() {
  const [, params] = useRoute("/show/episode/:slug");
  const slug = params?.slug || "";

  const { data: episode } = trpc.episodes.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  if (!episode) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>Episode not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <MetaTagsComponent
        title={`${episode.title} - The Hectic Show`}
        description={episode.description || "Listen to this episode of The Hectic Show"}
        url={`/show/episode/${episode.slug}`}
      />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Badge variant="outline" className="mb-2">{episode.status}</Badge>
          <h1 className="text-4xl font-bold mb-4">{episode.title}</h1>
          {episode.publishedAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(episode.publishedAt), "MMMM d, yyyy 'at' h:mm a")}
            </div>
          )}
        </div>

        {episode.description && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <p className="whitespace-pre-wrap">{episode.description}</p>
            </CardContent>
          </Card>
        )}

        {episode.recordingUrl && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recording</CardTitle>
            </CardHeader>
            <CardContent>
              <audio controls className="w-full">
                <source src={episode.recordingUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </CardContent>
          </Card>
        )}

        {!episode.recordingUrl && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>Recording not available yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

