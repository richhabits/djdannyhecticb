export const STREAMING_PLATFORM_SLUGS = [
  "spotify",
  "apple-music",
  "soundcloud",
  "youtube",
  "mixcloud",
  "tidal",
] as const;

export type StreamingPlatformSlug = (typeof STREAMING_PLATFORM_SLUGS)[number];

export interface StreamingPlatformMeta {
  slug: StreamingPlatformSlug;
  label: string;
  description: string;
  defaultUrl: string;
  defaultEmbedUrl?: string;
  brandColor: string;
  accentColor: string;
  icon: "music" | "apple" | "cloud" | "play" | "waves" | "radio";
}

const STREAMING_PLATFORM_DATA: StreamingPlatformMeta[] = [
  {
    slug: "spotify",
    label: "Spotify",
    description: "Follow the Hectic Radio show on Spotify for every episode and playlist drop.",
    defaultUrl: "https://open.spotify.com/show/dj-danny-hectic-b",
    defaultEmbedUrl: "https://open.spotify.com/embed/show/0",
    brandColor: "#1DB954",
    accentColor: "#0F4222",
    icon: "music",
  },
  {
    slug: "apple-music",
    label: "Apple Music",
    description: "Stream DJ Danny Hectic B on Apple Podcasts & Apple Music.",
    defaultUrl: "https://music.apple.com/us/curator/dj-danny-hectic-b",
    defaultEmbedUrl: "https://embed.music.apple.com/us/album/0",
    brandColor: "#FA2D48",
    accentColor: "#66121F",
    icon: "apple",
  },
  {
    slug: "soundcloud",
    label: "SoundCloud",
    description: "Dive into raw mixes, dubs, and exclusive drops on SoundCloud.",
    defaultUrl: "https://soundcloud.com/dj-danny-hectic-b",
    defaultEmbedUrl: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/0",
    brandColor: "#FF5500",
    accentColor: "#5A1A00",
    icon: "cloud",
  },
  {
    slug: "youtube",
    label: "YouTube",
    description: "Watch live sets, recaps, and behind-the-scenes energy on YouTube.",
    defaultUrl: "https://www.youtube.com/@djdannyhecticb",
    defaultEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    brandColor: "#FF0000",
    accentColor: "#4C0000",
    icon: "play",
  },
  {
    slug: "mixcloud",
    label: "Mixcloud",
    description: "Full-length shows archived on Mixcloud for serious listeners.",
    defaultUrl: "https://www.mixcloud.com/dj-danny-hectic-b/",
    defaultEmbedUrl: "https://www.mixcloud.com/widget/iframe/?feed=%2Fdj-danny-hectic-b%2F",
    brandColor: "#3B1E71",
    accentColor: "#12062A",
    icon: "radio",
  },
  {
    slug: "tidal",
    label: "TIDAL",
    description: "High-fidelity streaming for audiophiles who live for detail.",
    defaultUrl: "https://tidal.com/browse/artist/0",
    brandColor: "#00FFFF",
    accentColor: "#003333",
    icon: "waves",
  },
];

export const STREAMING_PLATFORM_META = STREAMING_PLATFORM_DATA.reduce(
  (acc, meta) => {
    acc[meta.slug] = meta;
    return acc;
  },
  {} as Record<StreamingPlatformSlug, StreamingPlatformMeta>
);

export const TOP_STREAMING_PLATFORMS = STREAMING_PLATFORM_DATA;
