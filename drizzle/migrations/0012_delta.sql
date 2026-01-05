-- Delta Migration: Apply missing indexes (Skipping shouts which exist)

-- Streams table indexes
CREATE INDEX idx_streams_is_active ON streams(isActive);

-- Shows table indexes
CREATE INDEX idx_shows_is_active ON shows(isActive);
CREATE INDEX idx_shows_day_start_time ON shows(dayOfWeek, startTime);

-- Events table indexes
CREATE INDEX idx_events_is_featured ON events(isFeatured);
CREATE INDEX idx_events_event_date ON events(eventDate);
CREATE INDEX idx_events_featured_date ON events(isFeatured, eventDate);

-- Mixes table indexes
CREATE INDEX idx_mixes_is_free ON mixes(isFree);
CREATE INDEX idx_mixes_created_at ON mixes(createdAt);

-- Danny Status table indexes
CREATE INDEX idx_danny_status_is_active ON danny_status(isActive);

-- Tracks table indexes
CREATE INDEX idx_tracks_played_at ON tracks(playedAt);

-- Users table indexes
CREATE INDEX idx_users_open_id ON users(openId);
CREATE INDEX idx_users_email ON users(email);

-- Feed Posts table indexes (Corrected table name)
CREATE INDEX idx_feed_posts_created_at ON feed_posts(createdAt);
CREATE INDEX idx_feed_posts_is_public ON feed_posts(isPublic);
