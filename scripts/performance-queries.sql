-- ============================================================================
-- Performance Monitoring & Analysis Queries
-- Run these queries to track optimization progress
-- ============================================================================

-- ============================================================================
-- 1. INDEX USAGE ANALYSIS
-- ============================================================================

-- Check which indexes are being used
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scan_count,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes (candidates for deletion)
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- 2. SLOW QUERY DETECTION
-- ============================================================================

-- Top slow queries (requires pg_stat_statements extension)
-- Enable: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time,
  total_exec_time,
  rows
FROM pg_stat_statements
WHERE mean_exec_time > 50  -- queries taking more than 50ms
ORDER BY mean_exec_time DESC
LIMIT 20;

-- ============================================================================
-- 3. TABLE STATISTICS
-- ============================================================================

-- Row count and size of all tables
SELECT
  schemaname,
  tablename,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  n_mod_since_analyze as modified_since_analyze,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- 4. CACHE HIT RATE (Database Level)
-- ============================================================================

-- Overall cache hit ratio
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_stat_user_tables;

-- Per-table cache hit ratio
SELECT
  schemaname,
  tablename,
  heap_blks_read,
  heap_blks_hit,
  CASE
    WHEN (heap_blks_hit + heap_blks_read) = 0 THEN 0
    ELSE ROUND(100.0 * heap_blks_hit / (heap_blks_hit + heap_blks_read), 2)
  END as cache_hit_ratio
FROM pg_stat_user_tables
WHERE (heap_blks_hit + heap_blks_read) > 0
ORDER BY cache_hit_ratio DESC;

-- ============================================================================
-- 5. INDEX CACHE HIT RATIO
-- ============================================================================

SELECT
  schemaname,
  tablename,
  indexname,
  idx_blks_read,
  idx_blks_hit,
  CASE
    WHEN (idx_blks_hit + idx_blks_read) = 0 THEN 0
    ELSE ROUND(100.0 * idx_blks_hit / (idx_blks_hit + idx_blks_read), 2)
  END as cache_hit_ratio
FROM pg_stat_user_indexes
WHERE (idx_blks_hit + idx_blks_read) > 0
ORDER BY cache_hit_ratio DESC;

-- ============================================================================
-- 6. SEQUENTIAL SCANS (Finding missing indexes)
-- ============================================================================

-- Tables with high sequential scans (may need indexes)
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  ROUND(100.0 * seq_scan / (seq_scan + idx_scan), 2) as seq_scan_ratio
FROM pg_stat_user_tables
WHERE (seq_scan + idx_scan) > 0
ORDER BY seq_scan DESC
LIMIT 20;

-- ============================================================================
-- 7. QUERY PERFORMANCE TIMELINE
-- ============================================================================

-- Most called queries
SELECT
  query,
  calls,
  mean_exec_time::numeric(10,2) as avg_ms,
  max_exec_time::numeric(10,2) as max_ms,
  (total_exec_time/calls)::numeric(10,2) as avg_total_ms
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 20;

-- ============================================================================
-- 8. VACUUM & ANALYZE STATUS
-- ============================================================================

-- Tables needing maintenance
SELECT
  schemaname,
  tablename,
  n_live_tup,
  n_dead_tup,
  ROUND(100.0 * n_dead_tup / n_live_tup, 2) as dead_ratio,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE n_live_tup > 1000
ORDER BY n_dead_tup DESC;

-- ============================================================================
-- 9. CONNECTION POOL STATUS
-- ============================================================================

-- Current connections
SELECT
  datname,
  usename,
  application_name,
  state,
  count(*) as connections
FROM pg_stat_activity
WHERE datname IS NOT NULL
GROUP BY datname, usename, application_name, state
ORDER BY connections DESC;

-- ============================================================================
-- 10. PERFORMANCE BASELINE CHECKS
-- ============================================================================

-- Monthly query performance check (if pg_stat_statements available)
-- Baseline creation:
CREATE TABLE IF NOT EXISTS perf_baseline (
  captured_at TIMESTAMP DEFAULT NOW(),
  metric_name VARCHAR(100),
  metric_value NUMERIC,
  metric_unit VARCHAR(50)
);

-- Insert baseline metrics
INSERT INTO perf_baseline (metric_name, metric_value, metric_unit)
SELECT
  'total_indexes',
  COUNT(*),
  'count'
FROM pg_stat_user_indexes
UNION ALL
SELECT
  'avg_index_size_mb',
  AVG(pg_relation_size(indexrelid))/1024/1024,
  'mb'
FROM pg_stat_user_indexes
UNION ALL
SELECT
  'total_table_size_mb',
  SUM(pg_total_relation_size(schemaname||'.'||tablename))/1024/1024,
  'mb'
FROM pg_stat_user_tables
UNION ALL
SELECT
  'avg_cache_hit_ratio',
  SUM(heap_blks_hit) / (SUM(heap_blks_hit) + SUM(heap_blks_read)) * 100,
  'percent'
FROM pg_stat_user_tables;

-- ============================================================================
-- 11. SPECIFIC TABLE PERFORMANCE (Examples)
-- ============================================================================

-- User authentication performance (hot table)
SELECT
  'users'::text as table_name,
  count(*) as row_count,
  pg_size_pretty(pg_total_relation_size('users')) as size,
  (SELECT count(*) FROM pg_stat_user_indexes WHERE relname ~ 'idx.*users') as indexes
UNION ALL
SELECT
  'event_bookings',
  count(*),
  pg_size_pretty(pg_total_relation_size('event_bookings')),
  (SELECT count(*) FROM pg_stat_user_indexes WHERE relname ~ 'idx.*bookings')
FROM event_bookings
UNION ALL
SELECT
  'subscriptions',
  count(*),
  pg_size_pretty(pg_total_relation_size('subscriptions')),
  (SELECT count(*) FROM pg_stat_user_indexes WHERE relname ~ 'idx.*subscription')
FROM subscriptions;

-- ============================================================================
-- 12. CACHE INVALIDATION & STATS
-- ============================================================================

-- For Redis monitoring (execute via redis-cli)
-- INFO memory              -- Memory usage
-- INFO keyspace           -- Key count
-- DBSIZE                  -- Number of keys
-- SLOWLOG GET 10          -- Last 10 slow commands

-- ============================================================================
-- 13. PERFORMANCE TARGETS VS ACTUAL
-- ============================================================================

-- Expected vs Actual Performance
SELECT
  'User Lookups (idx_users_email)' as query_type,
  '<5ms' as target,
  'See slow query log' as actual
UNION ALL
SELECT
  'Booking Queries (idx_event_bookings_*)',
  '<10ms',
  'See slow query log'
UNION ALL
SELECT
  'Feed Posts (idx_feed_posts_*)',
  '<50ms',
  'See slow query log'
UNION ALL
SELECT
  'Analytics Aggregates',
  '<100ms',
  'See slow query log';

-- ============================================================================
-- 14. CLEANUP QUERIES (USE WITH CAUTION)
-- ============================================================================

-- Reset query statistics (requires superuser)
-- SELECT pg_stat_statements_reset();

-- Re-analyze single table (after large data changes)
-- ANALYZE users;
-- ANALYZE event_bookings;
-- ANALYZE subscriptions;

-- Update table statistics
-- VACUUM ANALYZE tablename;

-- ============================================================================
-- NOTES FOR MONITORING
-- ============================================================================
-- 1. Run baseline queries weekly to track trends
-- 2. Monitor cache hit ratio - should stay >70% for hot data
-- 3. Check slow query log for queries >100ms
-- 4. Verify index usage - unused indexes waste space
-- 5. Monitor dead rows - high ratio indicates need for VACUUM
-- 6. Track connection pool - spikes indicate load issues
-- 7. Compare performance over time using baseline table
