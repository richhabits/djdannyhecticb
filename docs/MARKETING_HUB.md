# Marketing Hub Documentation

## Overview

The Marketing Hub is a comprehensive in-house marketing studio for managing leads, campaigns, outreach, social media posts, and venue discovery. It's designed to help you find and approach relevant clubs, bars, and venues internationally and locally.

## Features

### 1. **Marketing Leads Management** 📋
- Track clubs, bars, venues, festivals, events, and radio stations
- Store contact information (email, phone, website, social media)
- Manage lead status: new → contacted → interested → quoted → booked
- Assign leads to team members
- Set follow-up reminders
- View outreach history per lead

### 2. **Venue Scraper** 🔍
- Search for venues using Google Places API
- Search by location (city, country)
- Filter by type (club, bar, venue, festival)
- Automatically saves results to database
- Convert scraped venues to marketing leads with one click
- Supports manual venue entry

### 3. **Outreach Tracking** 📧
- Record all contact attempts (email, phone, social, in-person)
- Track response status (sent, delivered, opened, replied, bounced)
- View complete outreach history per lead
- Automatically updates "last contacted" date

### 4. **Marketing Campaigns** 🎯
- Create and manage marketing campaigns
- Track campaign types: outreach, social, email, advertising, partnership
- Set campaign budgets and dates
- Monitor campaign metrics
- Link campaigns to leads and activities

### 5. **Social Media Post Studio** 📱
- Create posts for multiple platforms:
  - Instagram (posts, stories, reels)
  - TikTok
  - YouTube
  - Twitter/X
  - Facebook
  - LinkedIn
  - Threads
- Schedule posts for future publishing
- Add hashtags, mentions, and location tags
- Track post metrics (likes, comments, shares, views)
- Link posts to content queue items

## Access

Navigate to: `/admin/marketing`

Or from Control Tower: Click "Marketing Hub" panel

## Usage Guide

### Finding New Venues

1. **Using Venue Scraper:**
   - Go to Marketing Hub → Scraper tab
   - Click "Search Venues"
   - Enter search query (e.g., "nightclub", "music venue")
   - Enter location (e.g., "London, UK" or "Manchester")
   - Select venue type
   - Click "Search Venues"
   - Review results and convert promising venues to leads

2. **Manual Entry:**
   - Go to Leads tab
   - Click "New Lead"
   - Fill in venue details
   - Save

### Managing Leads

1. **View Leads:**
   - All leads are listed in the Leads tab
   - Filter by status, type, location, or assigned team member
   - Click "View" to see full details and outreach history

2. **Update Lead Status:**
   - Click "View" on any lead
   - Change status using dropdown
   - Statuses: New → Contacted → Interested → Quoted → Booked → Declined → Archived

3. **Record Outreach:**
   - Open a lead
   - Scroll to "Record Outreach" section
   - Select outreach type (email, phone, social, in-person)
   - Enter message/notes
   - Click "Record Outreach"
   - This automatically updates "last contacted" date

### Creating Social Media Posts

1. Go to Social Posts tab
2. Click "New Post"
3. Select platform and post type
4. Write caption
5. Add media URLs (if applicable)
6. Add hashtags and mentions
7. Schedule for future or post immediately
8. Save

### Creating Campaigns

1. Go to Campaigns tab
2. Click "New Campaign"
3. Enter campaign details:
   - Name and description
   - Type (outreach, social, email, etc.)
   - Target audience
   - Dates and budget
4. Save and activate

## Database Schema

### Tables Created

1. **marketing_leads** - Venues, clubs, bars, etc.
2. **marketing_campaigns** - Marketing campaigns
3. **outreach_activities** - Contact attempts and responses
4. **social_media_posts** - Social media content
5. **venue_scraper_results** - Scraped venue data

## API Routes

All routes are under `/api/trpc/marketing.*`:

- `marketing.leads.*` - Lead management
- `marketing.campaigns.*` - Campaign management
- `marketing.outreach.*` - Outreach tracking
- `marketing.socialPosts.*` - Social media posts
- `marketing.scraper.*` - Venue scraping

## Setup

### Google Places API (for Venue Scraper)

1. Get API key from: https://console.cloud.google.com/
2. Enable "Places API"
3. Add to `.env`:
   ```bash
   GOOGLE_PLACES_API_KEY=your-api-key
   ```

### Database Migration

Run database migration to create tables:
```bash
pnpm db:push
```

## Workflow Example

1. **Discover Venues:**
   - Use scraper to find "nightclub London"
   - Review results
   - Convert promising venues to leads

2. **Initial Contact:**
   - Open lead
   - Record outreach (email with pitch)
   - Update status to "contacted"

3. **Follow-up:**
   - Set next follow-up date
   - Record subsequent outreach attempts
   - Update status as lead progresses

4. **Conversion:**
   - When lead shows interest, update to "interested"
   - Send quote, update to "quoted"
   - When booked, update to "booked"

5. **Social Promotion:**
   - Create social media posts about the booking
   - Schedule posts for optimal times
   - Track engagement metrics

## Tips

- **Use the scraper regularly** to build your lead database
- **Set follow-up reminders** to never miss a lead
- **Track all outreach** to see what works
- **Use campaigns** to organize marketing efforts
- **Schedule social posts** in advance for consistency
- **Review metrics** to improve your approach

## Future Enhancements

- Email templates for outreach
- Automated follow-up reminders
- Social media API integration (auto-posting)
- Lead scoring system
- CRM integration
- Analytics dashboard
- Bulk email campaigns
- Calendar integration for follow-ups

