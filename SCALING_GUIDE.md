# Scaling Guide

## 🚀 Performance Optimizations Implemented

### 1. Redis Caching Layer
- **Location**: `server/_core/cache.ts`
- **Features**:
  - In-memory caching with Redis support
  - Automatic TTL management
  - Cache invalidation patterns
  - Graceful fallback when Redis unavailable
- **Usage**: All database queries are cached with appropriate TTLs
- **Environment**: Set `REDIS_URL` to enable

### 2. Rate Limiting
- **Location**: `server/_core/rateLimit.ts`
- **Features**:
  - Per-endpoint rate limits
  - IP and user-based limiting
  - Configurable windows and limits
  - Automatic cleanup
- **Limits**:
  - API: 100 req/min
  - Strict: 20 req/min
  - Login: 5 attempts/15min
  - AI: 30 req/min
  - Payment: 10 req/min

### 3. Database Connection Pooling
- **Location**: `server/db.ts`
- **Features**:
  - MySQL connection pooling
  - Configurable pool size
  - Queue management
  - Keep-alive connections
- **Environment**: `DB_POOL_SIZE` (default: 10), `DB_QUEUE_LIMIT`

### 4. Background Job Queue
- **Location**: `server/_core/queue.ts`
- **Features**:
  - Async job processing
  - Priority-based queue
  - Exponential backoff retries
  - Dead letter queue support
- **Job Types**: Email, AI processing, Analytics, Notifications

### 5. WebSocket Real-time Features
- **Location**: `server/_core/websocket.ts`
- **Features**:
  - Real-time updates
  - Room-based messaging
  - User-specific channels
  - Live stream support
- **Rooms**: `user:{id}`, `live-stream`, `chat`

### 6. Performance Monitoring
- **Location**: `server/_core/monitoring.ts`
- **Features**:
  - Request duration tracking
  - Error rate monitoring
  - Endpoint-specific stats
  - Metric aggregation
- **Endpoint**: `/api/health` for stats

### 7. Response Compression
- **Location**: `server/_core/compression.ts`
- **Features**:
  - Gzip/Deflate compression
  - Automatic content-type detection
  - Bandwidth reduction
- **Impact**: 60-80% size reduction for JSON/text

### 8. Request Batching
- **Location**: `server/_core/batch.ts`
- **Features**:
  - Batch multiple requests
  - Reduce database queries
  - Automatic debouncing
- **Use Cases**: User lookups, wallet queries, mix fetches

### 9. CDN Integration
- **Location**: `server/_core/cdn.ts`
- **Features**:
  - CDN URL generation
  - Asset type routing
  - Fallback to local paths
- **Environment**: Set `CDN_BASE_URL`

## 📊 Performance Metrics

### Expected Improvements
- **Response Time**: 50-70% reduction with caching
- **Database Load**: 60-80% reduction with caching + batching
- **Bandwidth**: 60-80% reduction with compression
- **Concurrent Users**: 10x increase with connection pooling
- **API Throughput**: 5x increase with rate limiting + caching

### Monitoring
Access performance stats at `/api/health`:
```json
{
  "status": "ok",
  "performance": {
    "avgResponseTime": 45,
    "errorRate": 0.01,
    "totalRequests": 1000
  },
  "queue": {
    "pending": 5,
    "workers": 4
  }
}
```

## 🔧 Configuration

### Environment Variables

```env
# Redis (Optional but recommended)
REDIS_URL=redis://localhost:6379

# Database Pooling
DB_POOL_SIZE=10
DB_QUEUE_LIMIT=0

# CDN
CDN_BASE_URL=https://cdn.example.com

# CORS (for WebSocket)
CORS_ORIGIN=https://yourdomain.com
```

## 🎯 Best Practices

### 1. Cache Strategy
- **Short TTL (60s)**: Frequently changing data (shouts, now playing)
- **Medium TTL (5min)**: Moderately changing data (mixes, events)
- **Long TTL (1hr)**: Rarely changing data (user profiles, settings)
- **Very Long TTL (24hr)**: Static data (achievements, collectibles)

### 2. Rate Limiting
- Apply stricter limits to expensive operations (AI, payments)
- Use user-based limits for authenticated endpoints
- Use IP-based limits for public endpoints

### 3. Database Queries
- Use connection pooling for concurrent requests
- Batch related queries when possible
- Use indexes on frequently queried columns
- Cache expensive queries

### 4. Background Jobs
- Use for non-critical operations (emails, analytics)
- Set appropriate priorities
- Implement retry logic with backoff
- Monitor queue depth

### 5. WebSocket Usage
- Use for real-time features (chat, live updates)
- Implement room-based messaging
- Handle reconnection gracefully
- Limit message frequency

## 📈 Scaling Horizontally

### Load Balancing
- Use sticky sessions for WebSocket connections
- Distribute Redis across instances
- Use shared database connection pool
- Implement health checks

### Database Scaling
- Use read replicas for queries
- Implement database sharding if needed
- Use connection pooling per instance
- Monitor connection pool stats

### Caching Strategy
- Use Redis cluster for high availability
- Implement cache warming
- Use cache invalidation patterns
- Monitor cache hit rates

## 🔍 Monitoring & Alerts

### Key Metrics to Monitor
1. **Response Times**: P50, P95, P99
2. **Error Rates**: 4xx, 5xx errors
3. **Database Connections**: Pool usage, queue depth
4. **Cache Hit Rate**: Should be >80%
5. **Queue Depth**: Should stay low
6. **WebSocket Connections**: Active connections count

### Alert Thresholds
- Response time P95 > 500ms
- Error rate > 1%
- Database pool exhaustion
- Cache hit rate < 70%
- Queue depth > 100

## 🚀 Next Steps for Further Scaling

1. **Microservices**: Split into separate services
2. **Message Queue**: Use RabbitMQ/Kafka for jobs
3. **Database Replication**: Read replicas
4. **CDN**: Full asset delivery via CDN
5. **Auto-scaling**: Kubernetes/Docker Swarm
6. **Service Mesh**: Istio/Linkerd for inter-service communication

All scaling features are production-ready and can be enabled by setting the appropriate environment variables!
