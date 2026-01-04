-- Migration: Add performance indexes for frequently queried columns
-- Created: 2026-01-04
-- Purpose: Optimize database query performance for common lookups

-- Shouts table indexes
CREATE INDEX IF NOT EXISTS idx_shouts_approved ON shouts(approved);
CREATE INDEX IF NOT EXISTS idx_shouts_is_track_request ON shouts(isTrackRequest);
CREATE INDEX IF NOT EXISTS idx_shouts_created_at ON shouts(createdAt);
CREATE INDEX IF NOT EXISTS idx_shouts_approved_created ON shouts(approved, createdAt);
CREATE INDEX IF NOT EXISTS idx_shouts_track_request_approved ON shouts(isTrackRequest, approved);

-- Streams table indexes
CREATE INDEX IF NOT EXISTS idx_streams_is_active ON streams(isActive);

-- Shows table indexes
CREATE INDEX IF NOT EXISTS idx_shows_is_active ON shows(isActive);
CREATE INDEX IF NOT EXISTS idx_shows_day_start_time ON shows(dayOfWeek, startTime);

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON events(isFeatured);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(eventDate);
CREATE INDEX IF NOT EXISTS idx_events_featured_date ON events(isFeatured, eventDate);

-- Mixes table indexes
CREATE INDEX IF NOT EXISTS idx_mixes_is_free ON mixes(isFree);
CREATE INDEX IF NOT EXISTS idx_mixes_created_at ON mixes(createdAt);

-- Danny Status table indexes
CREATE INDEX IF NOT EXISTS idx_danny_status_is_active ON danny_status(isActive);

-- Tracks table indexes
CREATE INDEX IF NOT EXISTS idx_tracks_played_at ON tracks(playedAt);

-- Users table indexes (for auth queries)
CREATE INDEX IF NOT EXISTS idx_users_open_id ON users(openId);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Feed Posts table indexes
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON feedPosts(createdAt);
CREATE INDEX IF NOT EXISTS idx_feed_posts_is_public ON feedPosts(isPublic);
