-- UK Events Table Migration
-- Creates table for Ticketmaster and other event sources

CREATE TABLE IF NOT EXISTS uk_events (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(255) NOT NULL UNIQUE,
  source VARCHAR(50) NOT NULL,
  title VARCHAR(512) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  event_date TIMESTAMP NOT NULL,
  doors_time TIMESTAMP,
  venue VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  image_url VARCHAR(512),
  ticket_url VARCHAR(512),
  ticket_status VARCHAR(50),
  price_min NUMERIC(10, 2),
  price_max NUMERIC(10, 2),
  currency VARCHAR(3) DEFAULT 'GBP',
  artists TEXT,
  age_restriction VARCHAR(50),
  is_featured BOOLEAN DEFAULT FALSE,
  is_synced BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_uk_events_event_date ON uk_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_uk_events_category ON uk_events(category);
CREATE INDEX IF NOT EXISTS idx_uk_events_city ON uk_events(city);
CREATE INDEX IF NOT EXISTS idx_uk_events_external_id_source ON uk_events(external_id, source);
CREATE INDEX IF NOT EXISTS idx_uk_events_is_featured ON uk_events(is_featured);
CREATE INDEX IF NOT EXISTS idx_uk_events_is_synced ON uk_events(is_synced);

-- Create event_sync_status table for tracking sync health
CREATE TABLE IF NOT EXISTS event_sync_status (
  id SERIAL PRIMARY KEY,
  connector VARCHAR(100) UNIQUE NOT NULL,
  last_synced_at TIMESTAMP,
  last_successful_sync_at TIMESTAMP,
  sync_status VARCHAR(50),
  events_processed INTEGER DEFAULT 0,
  events_created INTEGER DEFAULT 0,
  events_updated INTEGER DEFAULT 0,
  error_message TEXT,
  sync_duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Initialize sync status for Ticketmaster
INSERT INTO event_sync_status (connector, sync_status, created_at, updated_at)
VALUES ('ticketmaster', 'pending', NOW(), NOW())
ON CONFLICT (connector) DO NOTHING;
