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

const TICKETMASTER_CONSUMER_KEY = process.env.TICKETMASTER_CONSUMER_KEY || "";
const TICKETMASTER_CONSUMER_SECRET = process.env.TICKETMASTER_CONSUMER_SECRET || "";

let cachedAccessToken = "";
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  try {
    const credentials = Buffer.from(`${TICKETMASTER_CONSUMER_KEY}:${TICKETMASTER_CONSUMER_SECRET}`).toString("base64");
    const response = await fetch("https://auth.ticketmaster.com/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      console.error("Failed to get Ticketmaster access token:", response.statusText);
      return "";
    }

    const data = await response.json() as { access_token: string; expires_in: number };
    cachedAccessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min before expiry
    return cachedAccessToken;
  } catch (error) {
    console.error("Error getting Ticketmaster token:", error);
    return "";
  }
}

async function fetchTicketmasterEvents(keyword: string = "music"): Promise<TicketmasterEvent[]> {
  console.log("[TM] Key configured:", !!TICKETMASTER_CONSUMER_KEY, "Secret configured:", !!TICKETMASTER_CONSUMER_SECRET);
  if (!TICKETMASTER_CONSUMER_KEY || !TICKETMASTER_CONSUMER_SECRET) {
    console.warn("[TM] Credentials not configured - KEY:", process.env.TICKETMASTER_CONSUMER_KEY ? "SET" : "MISSING", "SECRET:", process.env.TICKETMASTER_CONSUMER_SECRET ? "SET" : "MISSING");
    return [];
  }

  try {
    const token = await getAccessToken();
    if (!token) {
      console.warn("Could not obtain Ticketmaster access token");
      return [];
    }

    const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
    url.searchParams.set("keyword", keyword);
    url.searchParams.set("size", "50");
    url.searchParams.set("sort", "date,asc");
    url.searchParams.set("countryCode", "US");

    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

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
