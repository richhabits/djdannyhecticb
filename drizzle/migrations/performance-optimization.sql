-- Performance Optimization Migrations
-- Created: 2026-05-01
-- Purpose: Add composite indexes and optimize high-query tables

-- Chat Messages: Composite index for session + created_at sorting (most common query)
CREATE INDEX IF NOT EXISTS chat_messages_session_created_idx
  ON chat_messages(live_session_id, created_at DESC)
  WHERE is_deleted = false;

-- Chat Messages: Index for user search and activity
CREATE INDEX IF NOT EXISTS chat_messages_user_created_idx
  ON chat_messages(user_id, created_at DESC)
  WHERE is_deleted = false;

-- Donations: Composite index for session + status (filtering for stats)
CREATE INDEX IF NOT EXISTS donations_session_status_idx
  ON donations(live_session_id, status)
  WHERE status != 'refunded';

-- Donations: Index for user donation history
CREATE INDEX IF NOT EXISTS donations_user_status_created_idx
  ON donations(user_id, status, created_at DESC);

-- Reactions: Composite index for session + type + created_at
CREATE INDEX IF NOT EXISTS reactions_session_type_created_idx
  ON reactions(live_session_id, reaction_type, created_at DESC);

-- Leaderboards: Index for rankings (if this table exists)
CREATE INDEX IF NOT EXISTS leaderboards_user_ranking_idx
  ON leaderboards(user_id, ranking DESC)
  WHERE archived_at IS NULL;

-- User Badges: Index for querying earned badges (if used frequently)
CREATE INDEX IF NOT EXISTS user_badges_user_earned_idx
  ON user_badges(user_id, earned_at DESC)
  WHERE expires_at IS NULL OR expires_at > NOW();

-- Notifications: Index for user notifications (for real-time)
CREATE INDEX IF NOT EXISTS notifications_user_type_created_idx
  ON notifications(user_id, notification_type, created_at DESC)
  WHERE read_at IS NULL;

-- Streamer Stats: Index for stats aggregation
CREATE INDEX IF NOT EXISTS streamer_stats_user_date_idx
  ON streamer_stats(user_id, stat_date DESC)
  WHERE archived_at IS NULL;

-- Custom Emotes: Index for quick lookup
CREATE INDEX IF NOT EXISTS custom_emotes_user_active_idx
  ON custom_emotes(user_id)
  WHERE is_active = true;

-- Raids: Index for tracking activity
CREATE INDEX IF NOT EXISTS raids_source_target_idx
  ON raids(source_user_id, target_user_id, created_at DESC);

-- Social Links: Index for quick lookup
CREATE INDEX IF NOT EXISTS social_links_user_active_idx
  ON social_links(user_id)
  WHERE is_active = true;

-- Live Sessions: Composite index for active sessions (frequently queried)
CREATE INDEX IF NOT EXISTS live_sessions_active_streamer_idx
  ON live_sessions(is_live, streamer_user_id, started_at DESC)
  WHERE is_live = true;

-- IMPORTANT: Add partial index for soft-deleted records to avoid scanning them
-- This significantly improves query performance on tables with many deleted records
-- Note: Adjust if soft delete pattern differs in actual schema

-- ANALYZE tables after creating indexes
ANALYZE chat_messages;
ANALYZE donations;
ANALYZE reactions;
ANALYZE leaderboards;
ANALYZE user_badges;
ANALYZE notifications;
ANALYZE streamer_stats;
ANALYZE custom_emotes;
ANALYZE raids;
ANALYZE social_links;
ANALYZE live_sessions;
