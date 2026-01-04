# SEO Optimization Guide

This project includes comprehensive SEO features to maximize search engine visibility.

## Features Implemented

### 1. **Meta Tags** ✅
- Title tags
- Description tags
- Keywords
- Canonical URLs
- Open Graph tags (Facebook, LinkedIn)
- Twitter Card tags
- Robots meta tags

### 2. **Structured Data (JSON-LD)** ✅
- Person schema (for bio/about pages)
- MusicAlbum schema (for mixes)
- Event schema (for events)
- PodcastEpisode schema (for podcasts)
- WebSite schema (for homepage)

### 3. **Sitemap** ✅
- Auto-generated XML sitemap at `/sitemap.xml`
- Includes all pages, mixes, events, podcasts, episodes
- Updates automatically when content changes

### 4. **Robots.txt** ✅
- Configured at `/robots.txt`
- Blocks admin and API routes
- Points to sitemap

## Usage

### Adding Meta Tags to Pages

```tsx
import { MetaTagsComponent } from "@/components/MetaTags";

export default function MyPage() {
  return (
    <>
      <MetaTagsComponent
        title="Page Title | DJ Danny Hectic B"
        description="Page description for search engines"
        url="/my-page"
        image="/og-image.png"
        type="website"
        keywords="keyword1, keyword2, keyword3"
        canonical="https://djdannyhecticb.co.uk/my-page"
        robots="index, follow"
      />
      {/* Your page content */}
    </>
  );
}
```

### Adding Structured Data

```tsx
import { MusicStructuredData } from "@/components/StructuredData";

export default function MixPage({ mix }) {
  return (
    <>
      <MusicStructuredData
        name={mix.title}
        description={mix.description}
        image={mix.coverImageUrl}
        url={`https://djdannyhecticb.co.uk/mixes/${mix.id}`}
        datePublished={mix.createdAt.toISOString()}
        audioUrl={mix.audioUrl}
      />
      {/* Your page content */}
    </>
  );
}
```

### Available Structured Data Components

- `<PersonStructuredData />` - For bio/about pages
- `<MusicStructuredData />` - For mix/album pages
- `<EventStructuredData />` - For event pages
- `<PodcastStructuredData />` - For podcast episodes
- `<WebsiteStructuredData />` - For homepage

## SEO Best Practices

### 1. **Title Tags**
- Keep under 60 characters
- Include brand name
- Use descriptive, keyword-rich titles
- Example: `"UK Garage Mixes | DJ Danny Hectic B - Hectic Radio"`

### 2. **Descriptions**
- Keep under 160 characters
- Include primary keywords naturally
- Make it compelling for click-through
- Example: `"Listen to DJ Danny Hectic B's collection of UK Garage and House music mixes. Free downloads available."`

### 3. **Keywords**
- Use 5-10 relevant keywords
- Include location if relevant (e.g., "UK Garage")
- Include genre and artist name
- Example: `"DJ Danny Hectic B, UK Garage, House Music, DJ mixes, free music"`

### 4. **Canonical URLs**
- Always set canonical URLs to prevent duplicate content
- Use absolute URLs
- Example: `"https://djdannyhecticb.co.uk/mixes"`

### 5. **Images**
- Use high-quality images (1200x630px for OG images)
- Include alt text
- Optimize file sizes
- Use descriptive filenames

## Automatic SEO Features

### Sitemap Generation
- Automatically includes all public pages
- Updates when content is added/updated
- Accessible at: `https://djdannyhecticb.co.uk/sitemap.xml`

### Robots.txt
- Automatically configured
- Blocks admin routes
- Accessible at: `https://djdannyhecticb.co.uk/robots.txt`

## Testing SEO

### Google Search Console
1. Submit sitemap: `https://djdannyhecticb.co.uk/sitemap.xml`
2. Monitor indexing status
3. Check for errors

### Structured Data Testing
- Use Google's Rich Results Test: https://search.google.com/test/rich-results
- Validate JSON-LD schema

### Meta Tags Testing
- Use Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Use Twitter Card Validator: https://cards-dev.twitter.com/validator

## Performance Impact

All SEO features are optimized:
- Structured data is minimal (JSON-LD)
- Meta tags are lightweight
- Sitemap is generated on-demand (cached)
- No impact on page load times

## Next Steps

1. **Submit sitemap** to Google Search Console
2. **Verify structured data** with Google's tools
3. **Monitor** search performance
4. **Update** meta tags as content changes
5. **Add** more structured data to key pages

