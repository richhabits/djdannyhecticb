/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * Structured Data (JSON-LD) Component
 * 
 * Adds structured data to pages for better SEO
 */

import { useEffect } from "react";

interface StructuredDataProps {
  data: Record<string, any>;
  type?: "Person" | "MusicAlbum" | "Event" | "PodcastEpisode" | "Organization" | "WebSite";
}

export function StructuredData({ data, type }: StructuredDataProps) {
  useEffect(() => {
    // Add @type if not present
    const structuredData = {
      "@context": "https://schema.org",
      ...data,
    };

    if (type && !structuredData["@type"]) {
      structuredData["@type"] = type;
    }

    // Create or update script tag
    const scriptId = "structured-data";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(structuredData, null, 2);

    return () => {
      // Cleanup on unmount
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [data, type]);

  return null;
}

/**
 * Person Structured Data (for bio/about pages)
 */
export function PersonStructuredData({
  name,
  description,
  image,
  url,
  sameAs = [],
}: {
  name: string;
  description?: string;
  image?: string;
  url?: string;
  sameAs?: string[];
}) {
  return (
    <StructuredData
      type="Person"
      data={{
        "@type": "Person",
        name,
        description,
        image,
        url,
        sameAs,
        jobTitle: "DJ",
        knowsAbout: ["UK Garage", "House Music", "DJing", "Music Production"],
      }}
    />
  );
}

/**
 * Music Album/Mix Structured Data
 */
export function MusicStructuredData({
  name,
  description,
  image,
  url,
  datePublished,
  audioUrl,
}: {
  name: string;
  description?: string;
  image?: string;
  url: string;
  datePublished?: string;
  audioUrl?: string;
}) {
  return (
    <StructuredData
      type="MusicAlbum"
      data={{
        "@type": "MusicAlbum",
        name,
        description,
        image,
        url,
        datePublished,
        byArtist: {
          "@type": "Person",
          name: "DJ Danny Hectic B",
        },
        ...(audioUrl && {
          track: {
            "@type": "MusicRecording",
            audio: {
              "@type": "AudioObject",
              contentUrl: audioUrl,
            },
          },
        }),
      }}
    />
  );
}

/**
 * Event Structured Data
 */
export function EventStructuredData({
  name,
  description,
  startDate,
  location,
  image,
  url,
}: {
  name: string;
  description?: string;
  startDate: string;
  location: string;
  image?: string;
  url: string;
}) {
  return (
    <StructuredData
      type="Event"
      data={{
        "@type": "Event",
        name,
        description,
        startDate,
        location: {
          "@type": "Place",
          name: location,
        },
        image,
        url,
        organizer: {
          "@type": "Person",
          name: "DJ Danny Hectic B",
        },
      }}
    />
  );
}

/**
 * Podcast Episode Structured Data
 */
export function PodcastStructuredData({
  name,
  description,
  image,
  datePublished,
  audioUrl,
  url,
}: {
  name: string;
  description?: string;
  image?: string;
  datePublished: string;
  audioUrl: string;
  url: string;
}) {
  return (
    <StructuredData
      type="PodcastEpisode"
      data={{
        "@type": "PodcastEpisode",
        name,
        description,
        image,
        datePublished,
        url,
        associatedMedia: {
          "@type": "MediaObject",
          contentUrl: audioUrl,
          encodingFormat: "audio/mpeg",
        },
        partOfSeries: {
          "@type": "PodcastSeries",
          name: "DJ Danny Hectic B Podcast",
        },
      }}
    />
  );
}

/**
 * Website Structured Data (for homepage)
 */
export function WebsiteStructuredData({
  name,
  description,
  url,
  potentialAction,
}: {
  name: string;
  description?: string;
  url: string;
  potentialAction?: {
    "@type": string;
    target: string;
    "query-input": string;
  };
}) {
  return (
    <StructuredData
      type="WebSite"
      data={{
        "@type": "WebSite",
        name,
        description,
        url,
        ...(potentialAction && { potentialAction }),
      }}
    />
  );
}

