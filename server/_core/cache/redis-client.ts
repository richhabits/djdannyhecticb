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

export async function initializeRedis(config: Partial<RedisConfig> = {}): Promise<RedisClient> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (redisClient?.isOpen) {
    return redisClient;
  }

  const clientOptions: ClientOptions = {
    host: finalConfig.host,
    port: finalConfig.port,
    password: finalConfig.password,
    db: finalConfig.database,
    socket: {
      reconnectStrategy: (retries) => {
        const delay = Math.min(retries * 100, 3000);
        return delay;
      },
    },
  };

  const client = createClient(clientOptions);

  // Error handling
  client.on('error', (err) => {
    logger.error('Redis client error', {
      error: err.message,
      stack: err.stack,
    });
  });

  client.on('connect', () => {
    logger.info('Redis connected', {
      host: finalConfig.host,
      port: finalConfig.port,
    });
  });

  client.on('ready', () => {
    logger.info('Redis client ready');
  });

  client.on('reconnecting', () => {
    logger.warn('Redis reconnecting');
  });

  // Connect
  await client.connect();
  redisClient = client;

  return client;
}

export function getRedisClient(): RedisClient {
  if (!redisClient?.isOpen) {
    throw new Error(
      'Redis client not initialized. Call initializeRedis() before using getRedisClient()'
    );
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
