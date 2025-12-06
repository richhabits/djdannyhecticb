-- Database Indexes for Performance Optimization
-- Run these indexes to improve query performance

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openId);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Shouts table indexes
CREATE INDEX IF NOT EXISTS idx_shouts_approved ON shouts(approved);
CREATE INDEX IF NOT EXISTS idx_shouts_created_at ON shouts(createdAt);
CREATE INDEX IF NOT EXISTS idx_shouts_read_on_air ON shouts(readOnAir);

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON events(eventDate);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(isFeatured);
CREATE INDEX IF NOT EXISTS idx_events_date_featured ON events(eventDate, isFeatured);

-- Event bookings indexes
CREATE INDEX IF NOT EXISTS idx_event_bookings_start_time ON eventBookings(startTime);
CREATE INDEX IF NOT EXISTS idx_event_bookings_end_time ON eventBookings(endTime);
CREATE INDEX IF NOT EXISTS idx_event_bookings_user_id ON eventBookings(userId);
CREATE INDEX IF NOT EXISTS idx_event_bookings_status ON eventBookings(status);

-- Wallets indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(userId);
CREATE INDEX IF NOT EXISTS idx_wallets_balance ON wallets(balanceCoins);

-- Coin transactions indexes
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coinTransactions(userId);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coinTransactions(createdAt);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coinTransactions(type);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_source ON coinTransactions(source);

-- Redemptions indexes
CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(userId);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemptions(status);
CREATE INDEX IF NOT EXISTS idx_redemptions_created_at ON redemptions(createdAt);

-- Streams indexes
CREATE INDEX IF NOT EXISTS idx_streams_active ON streams(isActive);
CREATE INDEX IF NOT EXISTS idx_streams_type ON streams(type);

-- Tracks indexes
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks(createdAt);
CREATE INDEX IF NOT EXISTS idx_tracks_is_now_playing ON tracks(isNowPlaying);

-- Traffic events indexes (for analytics)
CREATE INDEX IF NOT EXISTS idx_traffic_events_user_id ON trafficEvents(userId);
CREATE INDEX IF NOT EXISTS idx_traffic_events_event_type ON trafficEvents(eventType);
CREATE INDEX IF NOT EXISTS idx_traffic_events_created_at ON trafficEvents(createdAt);
CREATE INDEX IF NOT EXISTS idx_traffic_events_user_type ON trafficEvents(userId, eventType);

-- Gen-Z profiles indexes
CREATE INDEX IF NOT EXISTS idx_genz_profiles_username ON genZProfiles(username);
CREATE INDEX IF NOT EXISTS idx_genz_profiles_user_id ON genZProfiles(userId);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_user_posts_profile_id ON userPosts(profileId);
CREATE INDEX IF NOT EXISTS idx_user_posts_created_at ON userPosts(createdAt);

-- Follows indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(followerId);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(followingId);
CREATE INDEX IF NOT EXISTS idx_follows_follower_following ON follows(followerId, followingId);

-- Show episodes indexes
CREATE INDEX IF NOT EXISTS idx_show_episodes_show_id ON showEpisodes(showId);
CREATE INDEX IF NOT EXISTS idx_show_episodes_air_date ON showEpisodes(airDate);

-- AI jobs indexes
CREATE INDEX IF NOT EXISTS idx_ai_script_jobs_status ON aiScriptJobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_script_jobs_created_at ON aiScriptJobs(createdAt);
CREATE INDEX IF NOT EXISTS idx_ai_voice_jobs_status ON aiVoiceJobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_video_jobs_status ON aiVideoJobs(status);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_shouts_approved_created ON shouts(approved, createdAt);
CREATE INDEX IF NOT EXISTS idx_events_upcoming ON events(eventDate, isFeatured) WHERE eventDate > NOW();
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON eventBookings(startTime, endTime, status);
