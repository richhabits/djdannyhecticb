/**
 * Redis Client Setup & Connection Management
 * Handles connection pooling, error recovery, and monitoring
 */

import { createClient, RedisClient, ClientOptions } from 'redis';
import { logger } from '../logging';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
  maxRetries: number;
  retryStrategy: (error: Error, attempt: number) => number;
  enableOfflineQueue: boolean;
}

const DEFAULT_CONFIG: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  database: parseInt(process.env.REDIS_DB || '0'),
  maxRetries: 5,
  retryStrategy: (error, attempt) => {
    const delay = Math.min(attempt * 100, 3000);
    logger.warn(`Redis connection attempt ${attempt}, retrying in ${delay}ms`, { error });
    return delay;
  },
  enableOfflineQueue: true,
};

let redisClient: RedisClient | null = null;

export async function initializeRedis(config: Partial<RedisConfig> = {}): Promise<RedisClient | null> {
  // Skip initialization if REDIS_URL is not set
  if (!process.env.REDIS_URL) {
    logger.info('Redis disabled: REDIS_URL not set');
    return null;
  }

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (redisClient?.isOpen) {
    return redisClient;
  }

  const clientOptions: ClientOptions = {
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        const delay = Math.min(retries * 100, 3000);
        return delay;
      },
      connectTimeout: 5000, // 5 second timeout for initial connection
    },
  };

  const client = createClient(clientOptions);

  // Error handling
  client.on('error', (err) => {
    logger.error('Redis client error', {
      error: err.message,
    });
  });

  client.on('connect', () => {
    logger.info('Redis connected');
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
  });

  client.on('reconnecting', () => {
    logger.warn('Redis reconnecting');
  });

  // Connect with timeout - don't block server startup
  try {
    await Promise.race([
      client.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis connection timeout')), 10000)
      ),
    ]);
    redisClient = client;
    return client;
  } catch (error) {
    logger.warn('Redis connection failed, continuing without cache', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't set redisClient, return null to indicate Redis is unavailable
    return null;
  }
}

export function getRedisClient(): RedisClient | null {
  if (!redisClient?.isOpen) {
    return null;
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient?.isOpen) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected');
  }
}

export { createClient };
