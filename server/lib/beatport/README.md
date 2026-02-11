# Beatport v4 API Integration

This directory contains the server-side Beatport v4 API integration for the DJ Danny Hectic B shop.

## Overview

The integration provides:
- **Server-side only** API access (secrets never reach the client)
- **Cached OAuth2 tokens** with automatic refresh
- **Type-safe tRPC endpoints** for catalog browsing and search

## Architecture

```
server/lib/beatport/
├── token.ts       # OAuth2 token manager with caching
├── client.ts      # HTTP client for Beatport API
├── types.ts       # TypeScript type definitions
├── router.ts      # tRPC router with shop endpoints
├── index.ts       # Public exports
└── beatport.test.ts  # Unit tests
```

## Configuration

Add these environment variables to your `.env` file:

```bash
BEATPORT_CLIENT_ID=your_client_id_here
BEATPORT_CLIENT_SECRET=your_client_secret_here
BEATPORT_API_BASE=https://api.beatport.com/v4
```

## Available Endpoints

All endpoints are accessible via tRPC under the `beatport` namespace:

### Catalog Endpoints

- `beatport.genres` - Get all enabled genres
- `beatport.subGenres` - Get sub-genres (optionally filtered by genre)
- `beatport.charts` - Get published charts (optionally filtered by genre)
- `beatport.chartTracks` - Get tracks for a specific chart
- `beatport.tracks` - Browse/filter tracks by various criteria
- `beatport.search` - Search across catalog

### Auxiliary Endpoints

- `beatport.artistTypes` - Get artist types metadata
- `beatport.commercialModelTypes` - Get commercial model types

### Optional Endpoints

- `beatport.chartImages` - Get images for a chart

### Health Check Endpoints

- `beatport.healthCheck` - API health check
- `beatport.dbHealthCheck` - Database health check

## Usage Examples

### Client-side (React with tRPC)

```typescript
import { trpc } from "./lib/trpc";

function GenreList() {
  const { data, isLoading } = trpc.beatport.genres.useQuery({
    pageSize: 50
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.results.map(genre => (
        <li key={genre.id}>{genre.name}</li>
      ))}
    </ul>
  );
}

function TrackSearch() {
  const [query, setQuery] = useState("");
  const { data } = trpc.beatport.search.useQuery(
    { q: query, type: "tracks" },
    { enabled: query.length > 0 }
  );

  return (
    <>
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)} 
        placeholder="Search tracks..."
      />
      {data?.tracks?.results.map(track => (
        <div key={track.id}>
          <h3>{track.title}</h3>
          <p>{track.artists?.map(a => a.name).join(", ")}</p>
        </div>
      ))}
    </>
  );
}
```

### Server-side (Direct API access)

```typescript
import { beatportGet } from "./lib/beatport";

// Get genres
const genres = await beatportGet("/catalog/genres/", { enabled: true });

// Search tracks
const searchResults = await beatportGet("/catalog/search/", {
  q: "techno",
  type: "tracks"
});

// Get chart tracks
const chartTracks = await beatportGet("/catalog/charts/123/tracks/");
```

## Token Management

The token manager (`token.ts`) handles OAuth2 authentication automatically:

- Requests tokens using the `client_credentials` grant type
- Caches tokens in memory until expiration
- Automatically refreshes expired tokens
- Includes 30-second safety margin before expiration
- Redacts sensitive information in logs

## Error Handling

The integration includes custom error handling:

```typescript
import { BeatportError } from "./lib/beatport";

try {
  const data = await beatportGet("/catalog/genres/");
} catch (error) {
  if (error instanceof BeatportError) {
    console.error("Beatport API error:", error.statusCode, error.message);
  }
}
```

## Testing

Run the test suite:

```bash
pnpm test server/lib/beatport/beatport.test.ts
```

The tests cover:
- Token request and caching
- Token expiration and refresh
- HTTP client functionality
- Query parameter handling
- Error scenarios

## Security Notes

- ✅ Credentials are **server-side only** (never exposed to client)
- ✅ Tokens are **cached in memory** (not in database or files)
- ✅ Sensitive data is **redacted in logs**
- ✅ All endpoints use **authenticated requests**
- ✅ Input validation with **Zod schemas**

## API Documentation

For detailed Beatport API documentation, refer to:
- Beatport API v4 Documentation (contact Beatport for access)

## Troubleshooting

### "Beatport credentials not configured"
Make sure `BEATPORT_CLIENT_ID` and `BEATPORT_CLIENT_SECRET` are set in your `.env` file.

### "Failed to request Beatport token"
- Verify your credentials are correct
- Check that the API base URL is accessible
- Ensure your IP is whitelisted (if required by Beatport)

### Token expiration issues
The token manager automatically handles expiration. If you encounter issues:
1. Check the console logs for token-related errors
2. Verify the system clock is correct
3. Clear the token cache manually if needed: `clearTokenCache()`
