/**
 * Mock data for local development when database is not available
 */

export const mockMixes = [
  {
    id: 1,
    title: "Garage Classics Mix",
    description: "The best of UK Garage from 1998-2004",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
    duration: 3600,
    genre: "Garage",
    isFree: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    title: "Soulful House Journey",
    description: "Deep and soulful house vibes",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500&q=80",
    duration: 4500,
    genre: "Soulful House",
    isFree: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    title: "Amapiano Vibes",
    description: "The latest Amapiano sounds from South Africa",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1514525253344-f81bad38940c?w=500&q=80",
    duration: 3300,
    genre: "Amapiano",
    isFree: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockEvents = [
  {
    id: 1,
    title: "Ministry of Sound",
    description: "DJ Danny Hectic B live in the Box",
    eventDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
    location: "London, UK",
    imageUrl: "https://images.unsplash.com/photo-1514525253344-f81bad38940c?w=800&q=80",
    ticketUrl: "#",
    price: "£20",
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    title: "Warehouse Project",
    description: "UKG Takeover",
    eventDate: new Date(Date.now() + 86400000 * 14), // 14 days from now
    location: "Manchester, UK",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    ticketUrl: "#",
    price: "£25",
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockPodcasts = [
  {
    id: 1,
    title: "Hectic History Ep. 1",
    description: "Starting out on pirate radio",
    episodeNumber: 1,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverImageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&q=80",
    duration: 1800,
    spotifyUrl: "https://spotify.com",
    applePodcastsUrl: "https://apple.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockStreamingLinks = [
  { id: 1, platform: 'spotify', url: 'https://spotify.com', displayName: 'Spotify', order: 1 },
  { id: 2, platform: 'apple-music', url: 'https://apple.com', displayName: 'Apple Music', order: 2 },
  { id: 3, platform: 'soundcloud', url: 'https://soundcloud.com', displayName: 'SoundCloud', order: 3 },
];

export const mockShouts = [
  {
    id: 1,
    name: "Big Dave",
    location: "London",
    message: "Locking in from South London! Play some classic Garage!",
    canReadOnAir: true,
    approved: true,
    readOnAir: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Sarah V",
    location: "Essex",
    message: "Happy birthday to my sister! We're vibing to the mix!",
    canReadOnAir: true,
    approved: true,
    readOnAir: true,
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
  },
];

export const mockTracks = [
  {
    id: 1,
    title: "Re-Rewind",
    artist: "The Artful Dodger",
    playedAt: new Date(),
  },
  {
    id: 2,
    title: "Flowers",
    artist: "Sweet Female Attitude",
    playedAt: new Date(Date.now() - 300000),
  },
  {
    id: 3,
    title: "Body Groove",
    artist: "Architechs",
    playedAt: new Date(Date.now() - 600000),
  },
];

export const mockShows = [
  {
    id: 1,
    name: "The Hectic Morning Show",
    host: "DJ Danny Hectic B",
    description: "Starting your day with the best vibes",
    dayOfWeek: 1, // Monday
    startTime: "09:00",
    endTime: "12:00",
    isActive: true,
  },
  {
    id: 2,
    name: "Garage Anthems",
    host: "DJ Danny Hectic B",
    description: "Pure UK Garage classics",
    dayOfWeek: 5, // Friday
    startTime: "20:00",
    endTime: "22:00",
    isActive: true,
  },
];

export const mockStreams = [
  {
    id: 1,
    name: "Hectic Radio Main",
    type: "icecast",
    publicUrl: "https://stream.example.com/hectic-radio",
    statsUrl: "https://stream.example.com/status-json.xsl",
    active: true,
    stats: {
      listeners: 124,
      peak: 250,
      currentTrack: "DJ EZ - Pure Garage Mix",
    },
  },
];

export const mockDannyStatus = [
  {
    id: 1,
    status: "On Air",
    message: "Locking in live from the studio!",
    isActive: true,
  }
];

export const mockTrackRequests = [
  {
    id: 1,
    name: "Classic Garage Head",
    trackTitle: "A Little Bit of Luck",
    trackArtist: "DJ Luck & MC Neat",
    votes: 12,
    trackStatus: "queued",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "House Lover",
    trackTitle: "Finally",
    trackArtist: "Kings of Tomorrow",
    votes: 8,
    trackStatus: "pending",
    createdAt: new Date(Date.now() - 1800000),
  },
];

export const mockIncidentBanners = [
  {
    id: 1,
    message: "Live from the studio soon! Lock in.",
    type: "info",
    isActive: true,
  }
];

export const mockFeedPosts = [
  {
    id: 1,
    type: "post",
    title: "Back in the Studio!",
    content: "Working on some fresh Garage cuts for the weekend. Can't wait for you guys to hear this one.",
    reactions: JSON.stringify({ "🔥": 24, "🎧": 12 }),
    isVipOnly: false,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: 2,
    type: "photo",
    title: "Last night at Ministry",
    mediaUrl: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?auto=format&fit=crop&q=80",
    content: "What a night! The energy was incredible. Thanks to everyone who came out.",
    reactions: JSON.stringify({ "💥": 45, "🔥": 32 }),
    isVipOnly: false,
    createdAt: new Date(Date.now() - 86400000),
  }
];

export const moreMockFeedPosts = [
  {
    id: 3,
    type: "clip",
    title: "Vibing to the new mix",
    mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    content: "Dropping this weekend! Stay locked.",
    reactions: JSON.stringify({ "🎧": 15, "🔥": 20 }),
    isVipOnly: false,
    createdAt: new Date(Date.now() - 172800000),
  }
];
