import { Router } from "express";

const router = Router();

interface TicketmasterEvent {
  id: string;
  name: string;
  type: string;
  dates: {
    start: {
      localDate: string;
      localTime: string;
    };
  };
  _embedded: {
    venues: Array<{
      name: string;
      city: { name: string };
      state?: { stateCode: string };
    }>;
  };
  url: string;
  images: Array<{ url: string }>;
  priceRanges?: Array<{ min: number; max: number; currency: string }>;
}

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY || "";

async function fetchTicketmasterEvents(keyword: string = "dj danny"): Promise<TicketmasterEvent[]> {
  if (!TICKETMASTER_API_KEY) {
    console.warn("Ticketmaster API key not configured");
    return [];
  }

  try {
    const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
    url.searchParams.set("keyword", keyword);
    url.searchParams.set("apikey", TICKETMASTER_API_KEY);
    url.searchParams.set("size", "10");
    url.searchParams.set("sort", "date,asc");

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("Ticketmaster API error:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data._embedded?.events || [];
  } catch (error) {
    console.error("Failed to fetch Ticketmaster events:", error);
    return [];
  }
}

router.get("/events", async (req, res) => {
  try {
    const events = await fetchTicketmasterEvents();

    const formattedEvents = events.map((event: TicketmasterEvent) => ({
      id: event.id,
      name: event.name,
      type: event.type,
      date: event.dates.start.localDate,
      time: event.dates.start.localTime,
      venue: event._embedded.venues[0]?.name || "TBA",
      city: event._embedded.venues[0]?.city.name || "TBA",
      state: event._embedded.venues[0]?.state?.stateCode || "",
      url: event.url,
      image: event.images[0]?.url,
      minPrice: event.priceRanges?.[0]?.min,
      maxPrice: event.priceRanges?.[0]?.max,
      currency: event.priceRanges?.[0]?.currency,
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error("Failed to get events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/events/upcoming", async (req, res) => {
  try {
    const events = await fetchTicketmasterEvents();

    const upcoming = events
      .filter((event: TicketmasterEvent) => {
        const eventDate = new Date(event.dates.start.localDate);
        return eventDate > new Date();
      })
      .slice(0, 5);

    const formattedEvents = upcoming.map((event: TicketmasterEvent) => ({
      id: event.id,
      name: event.name,
      date: event.dates.start.localDate,
      time: event.dates.start.localTime,
      venue: event._embedded.venues[0]?.name || "TBA",
      city: event._embedded.venues[0]?.city.name || "TBA",
      url: event.url,
      image: event.images[0]?.url,
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error("Failed to get upcoming events:", error);
    res.status(500).json({ error: "Failed to fetch upcoming events" });
  }
});

export default router;
