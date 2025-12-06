import { ENV } from './env';

let spotifyAccessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get Spotify access token (client credentials flow)
 */
async function getSpotifyToken(): Promise<string> {
  if (!ENV.spotifyClientId || !ENV.spotifyClientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  // Return cached token if still valid
  if (spotifyAccessToken && Date.now() < tokenExpiry) {
    return spotifyAccessToken;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${ENV.spotifyClientId}:${ENV.spotifyClientSecret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify token');
  }

  const data = await response.json();
  spotifyAccessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min before expiry

  return spotifyAccessToken;
}

/**
 * Search for tracks on Spotify
 */
export async function searchSpotifyTracks(query: string, limit: number = 10) {
  const token = await getSpotifyToken();

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Spotify search failed');
  }

  const data = await response.json();
  return data.tracks.items.map((track: any) => ({
    id: track.id,
    name: track.name,
    artist: track.artists[0]?.name || 'Unknown',
    album: track.album.name,
    previewUrl: track.preview_url,
    spotifyUrl: track.external_urls.spotify,
    coverImage: track.album.images[0]?.url,
  }));
}

/**
 * Get artist information
 */
export async function getSpotifyArtist(artistId: string) {
  const token = await getSpotifyToken();

  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get artist');
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    genres: data.genres,
    popularity: data.popularity,
    followers: data.followers.total,
    image: data.images[0]?.url,
    spotifyUrl: data.external_urls.spotify,
  };
}

/**
 * Get YouTube video info
 */
export async function getYouTubeVideo(videoId: string) {
  if (!ENV.youtubeApiKey) {
    throw new Error('YouTube API key not configured');
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${ENV.youtubeApiKey}`
  );

  if (!response.ok) {
    throw new Error('YouTube API request failed');
  }

  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    return null;
  }

  const video = data.items[0];
  return {
    id: video.id,
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnail: video.snippet.thumbnails.high?.url,
    channelTitle: video.snippet.channelTitle,
    publishedAt: video.snippet.publishedAt,
    viewCount: parseInt(video.statistics.viewCount),
    likeCount: parseInt(video.statistics.likeCount),
    commentCount: parseInt(video.statistics.commentCount),
  };
}

/**
 * Search YouTube videos
 */
export async function searchYouTube(query: string, maxResults: number = 10) {
  if (!ENV.youtubeApiKey) {
    throw new Error('YouTube API key not configured');
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${ENV.youtubeApiKey}`
  );

  if (!response.ok) {
    throw new Error('YouTube search failed');
  }

  const data = await response.json();
  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high?.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
  }));
}

/**
 * Get Instagram user media (requires access token from user)
 */
export async function getInstagramMedia(accessToken: string, limit: number = 10) {
  const response = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${limit}&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error('Instagram API request failed');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Post to Twitter/X (requires OAuth 2.0)
 */
export async function postToTwitter(params: {
  text: string;
  accessToken: string;
}) {
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: params.text }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter API error: ${error}`);
  }

  return await response.json();
}

/**
 * Get Google Calendar events
 */
export async function getGoogleCalendarEvents(params: {
  maxResults?: number;
  timeMin?: string;
  timeMax?: string;
}) {
  if (!ENV.googleCalendarApiKey || !ENV.googleCalendarId) {
    throw new Error('Google Calendar not configured');
  }

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(ENV.googleCalendarId) + '/events');
  url.searchParams.set('key', ENV.googleCalendarApiKey);
  url.searchParams.set('maxResults', (params.maxResults || 10).toString());
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  
  if (params.timeMin) {
    url.searchParams.set('timeMin', params.timeMin);
  }
  if (params.timeMax) {
    url.searchParams.set('timeMax', params.timeMax);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Google Calendar API request failed');
  }

  const data = await response.json();
  return data.items.map((event: any) => ({
    id: event.id,
    title: event.summary,
    description: event.description,
    location: event.location,
    startTime: event.start.dateTime || event.start.date,
    endTime: event.end.dateTime || event.end.date,
    url: event.htmlLink,
  }));
}

/**
 * Send webhook notification
 */
export async function sendWebhook(url: string, payload: any) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[Webhook] Failed:', url, response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return false;
  }
}

/**
 * Send Zapier webhook for bookings
 */
export async function notifyZapierBooking(booking: any) {
  if (!ENV.zapierBookingWebhook) {
    return false;
  }

  return await sendWebhook(ENV.zapierBookingWebhook, {
    event: 'new_booking',
    data: booking,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Send Zapier webhook for shouts
 */
export async function notifyZapierShout(shout: any) {
  if (!ENV.zapierShoutWebhook) {
    return false;
  }

  return await sendWebhook(ENV.zapierShoutWebhook, {
    event: 'new_shout',
    data: shout,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Send Slack notification
 */
export async function sendSlackNotification(message: string, attachments?: any[]) {
  if (!ENV.slackWebhookUrl) {
    return false;
  }

  return await sendWebhook(ENV.slackWebhookUrl, {
    text: message,
    attachments,
  });
}
