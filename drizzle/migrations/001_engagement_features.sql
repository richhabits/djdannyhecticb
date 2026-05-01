-- Live Streaming Engagement Features Migration
-- 2024-04-30: Initial schema for live chat, donations, reactions, polls, leaderboards

-- ==========================================
-- ENUMS
-- ==========================================
CREATE TYPE user_badge_type AS ENUM (
  'subscriber',
  'moderator',
  'founder',
  'first_100',
  'first_1000',
  'donation_100',
  'donation_500',
  'donation_1000',
  'vip'
);

CREATE TYPE reaction_type AS ENUM (
  'fire',
  'love',
  'hype',
  'laugh',
  'sad',
  'angry',
  'thinking'
);

CREATE TYPE poll_status AS ENUM (
  'active',
  'closed',
  'archived'
);

CREATE TYPE notification_type AS ENUM (
  'follower',
  'subscriber',
  'donation',
  'milestone',
  'raid',
  'host'
);

-- ==========================================
-- LIVE SESSIONS
-- ==========================================
CREATE TABLE live_sessions (
  id SERIAL PRIMARY KEY,
  streamer_user_id INTEGER NOT NULL,
  platform_type VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_live BOOLEAN DEFAULT false NOT NULL,
  viewer_count INTEGER DEFAULT 0 NOT NULL,
  total_tips NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX live_sessions_streamer_idx ON live_sessions(streamer_user_id);
CREATE INDEX live_sessions_is_live_idx ON live_sessions(is_live);

-- ==========================================
-- CHAT MESSAGES
-- ==========================================
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  live_session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  username_color VARCHAR(7) DEFAULT '#ffffff' NOT NULL,
  is_pinned BOOLEAN DEFAULT false NOT NULL,
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  deleted_by INTEGER,
  deleted_reason VARCHAR(255),
  emotes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX chat_messages_session_idx ON chat_messages(live_session_id);
CREATE INDEX chat_messages_user_idx ON chat_messages(user_id);
CREATE INDEX chat_messages_pinned_idx ON chat_messages(is_pinned);
CREATE INDEX chat_messages_created_idx ON chat_messages(created_at);

-- ==========================================
-- USER BADGES
-- ==========================================
CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  badge_type user_badge_type NOT NULL,
  live_session_id INTEGER,
  earned_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX user_badges_user_idx ON user_badges(user_id);
CREATE INDEX user_badges_type_idx ON user_badges(badge_type);
CREATE INDEX user_badges_session_idx ON user_badges(live_session_id);
CREATE UNIQUE INDEX user_badges_user_type_session_unique
  ON user_badges(user_id, badge_type, COALESCE(live_session_id, 0));

-- ==========================================
-- DONATIONS
-- ==========================================
CREATE TABLE donations (
  id SERIAL PRIMARY KEY,
  live_session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
  message TEXT,
  stripe_payment_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'completed' NOT NULL,
  tip_jar BOOLEAN DEFAULT false NOT NULL,
  anonymous BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX donations_session_idx ON donations(live_session_id);
CREATE INDEX donations_user_idx ON donations(user_id);
CREATE INDEX donations_status_idx ON donations(status);
CREATE INDEX donations_stripe_payment_idx ON donations(stripe_payment_id);
CREATE INDEX donations_created_idx ON donations(created_at);

-- ==========================================
-- REACTIONS
-- ==========================================
CREATE TABLE reactions (
  id SERIAL PRIMARY KEY,
  live_session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  reaction_type reaction_type NOT NULL,
  count INTEGER DEFAULT 1 NOT NULL,
  combo_streak INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX reactions_session_idx ON reactions(live_session_id);
CREATE INDEX reactions_user_idx ON reactions(user_id);
CREATE INDEX reactions_type_idx ON reactions(reaction_type);
CREATE INDEX reactions_created_idx ON reactions(created_at);

-- ==========================================
-- POLLS
-- ==========================================
CREATE TABLE polls (
  id SERIAL PRIMARY KEY,
  live_session_id INTEGER NOT NULL,
  created_by INTEGER NOT NULL,
  question VARCHAR(255) NOT NULL,
  options TEXT[] NOT NULL,
  status poll_status DEFAULT 'active' NOT NULL,
  total_votes INTEGER DEFAULT 0 NOT NULL,
  vote_counts JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  closed_at TIMESTAMP
);

CREATE INDEX polls_session_idx ON polls(live_session_id);
CREATE INDEX polls_status_idx ON polls(status);

-- ==========================================
-- POLL VOTES
-- ==========================================
CREATE TABLE poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX poll_votes_poll_idx ON poll_votes(poll_id);
CREATE INDEX poll_votes_user_idx ON poll_votes(user_id);
CREATE UNIQUE INDEX poll_votes_user_poll_unique ON poll_votes(user_id, poll_id);

-- ==========================================
-- LEADERBOARDS
-- ==========================================
CREATE TABLE leaderboards (
  id SERIAL PRIMARY KEY,
  live_session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  total_donations NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  message_count INTEGER DEFAULT 0 NOT NULL,
  reaction_count INTEGER DEFAULT 0 NOT NULL,
  streak_days INTEGER DEFAULT 0 NOT NULL,
  rank INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX leaderboards_session_idx ON leaderboards(live_session_id);
CREATE INDEX leaderboards_user_idx ON leaderboards(user_id);
CREATE INDEX leaderboards_donation_idx ON leaderboards(total_donations);
CREATE INDEX leaderboards_rank_idx ON leaderboards(rank);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  live_session_id INTEGER NOT NULL,
  user_id INTEGER,
  notification_type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX notifications_session_idx ON notifications(live_session_id);
CREATE INDEX notifications_user_idx ON notifications(user_id);
CREATE INDEX notifications_type_idx ON notifications(notification_type);

-- ==========================================
-- STREAMER STATS (Cached)
-- ==========================================
CREATE TABLE streamer_stats (
  id SERIAL PRIMARY KEY,
  streamer_user_id INTEGER NOT NULL UNIQUE,
  total_viewers INTEGER DEFAULT 0 NOT NULL,
  total_tips_24h NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  total_tips_all_time NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  total_followers INTEGER DEFAULT 0 NOT NULL,
  total_subscribers INTEGER DEFAULT 0 NOT NULL,
  streak_days INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  experience INTEGER DEFAULT 0 NOT NULL,
  badges TEXT[] DEFAULT ARRAY[]::text[],
  last_updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX streamer_stats_streamer_idx ON streamer_stats(streamer_user_id);

-- ==========================================
-- CUSTOM EMOTES
-- ==========================================
CREATE TABLE custom_emotes (
  id SERIAL PRIMARY KEY,
  streamer_id INTEGER NOT NULL,
  name VARCHAR(50) NOT NULL,
  image_url VARCHAR(512) NOT NULL,
  tier VARCHAR(50) DEFAULT 'free' NOT NULL,
  usage_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX custom_emotes_streamer_idx ON custom_emotes(streamer_id);
CREATE INDEX custom_emotes_name_idx ON custom_emotes(name);

-- ==========================================
-- RAIDS
-- ==========================================
CREATE TABLE raids (
  id SERIAL PRIMARY KEY,
  from_streamer_id INTEGER NOT NULL,
  to_streamer_id INTEGER NOT NULL,
  viewers_raided INTEGER NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX raids_from_idx ON raids(from_streamer_id);
CREATE INDEX raids_to_idx ON raids(to_streamer_id);

-- ==========================================
-- SOCIAL LINKS
-- ==========================================
CREATE TABLE social_links (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  twitter_url VARCHAR(512),
  instagram_url VARCHAR(512),
  tiktok_url VARCHAR(512),
  youtube_url VARCHAR(512),
  discord_url VARCHAR(512),
  twitch_url VARCHAR(512),
  affiliate_links JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX social_links_user_idx ON social_links(user_id);

-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================
-- Grant appropriate permissions to application user
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
