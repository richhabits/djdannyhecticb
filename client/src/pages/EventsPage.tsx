/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { MetaTagsComponent } from "@/components/MetaTags";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function EventsPage() {
  const { data: events, isLoading } = trpc.eventsPhase7.list.useQuery({ upcomingOnly: true });

  return (
    <>
      <MetaTagsComponent
        title="Events - Danny Hectic B"
        description="Upcoming events, streams, and performances with DJ Danny Hectic B"
        url="/events"
      />
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-muted-foreground">Catch Danny live at these events and streams</p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p>Loading events...</p>
            </CardContent>
          </Card>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <Badge variant={event.status === "live" ? "default" : "outline"}>
                      {event.status}
                    </Badge>
                  </div>
                  <Badge variant="secondary">{event.type}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(event.dateTimeStart), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {event.ticketsUrl && (
                    <a
                      href={event.ticketsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      Get Tickets <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No upcoming events scheduled. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

