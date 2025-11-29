import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Calendar, Play } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";
import { format } from "date-fns";

export default function ShowEpisodes() {
  const { data: episodes } = trpc.episodes.listByShow.useQuery({ limit: 100 });

  return (
    <>
      <MetaTagsComponent
        title="Show Episodes - DJ Danny Hectic B"
        description="Browse all episodes of The Hectic Show"
        url="/show/episodes"
      />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">All Episodes</h1>
          <p className="text-muted-foreground">Browse and listen to past episodes</p>
        </div>

        {episodes && episodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map((episode) => (
              <Card key={episode.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{episode.title}</CardTitle>
                  <Badge variant="outline">{episode.status}</Badge>
                </CardHeader>
                <CardContent>
                  {episode.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {episode.description}
                    </p>
                  )}
                  {episode.publishedAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(episode.publishedAt), "MMMM d, yyyy")}
                    </div>
                  )}
                  <Link href={`/show/episode/${episode.slug}`}>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      View Episode
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>No episodes published yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

