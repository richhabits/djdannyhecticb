/**
 * Request Batching System
 * Batches multiple requests to reduce database queries
 */

interface BatchRequest<T> {
  key: string;
  resolver: (value: T) => void;
  rejector: (error: Error) => void;
}

class BatchProcessor<T> {
  private batch: Map<string, BatchRequest<T>[]> = new Map();
  private batchTimeout: number = 50; // ms
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Add a request to the batch
   */
  async add(key: string, fetcher: (keys: string[]) => Promise<Map<string, T>>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batch.has(key)) {
        this.batch.set(key, []);
      }

      this.batch.get(key)!.push({ key, resolver: resolve, rejector: reject });

      // Set timeout for this batch
      if (!this.timers.has(key)) {
        const timer = setTimeout(() => {
          this.processBatch(key, fetcher);
        }, this.batchTimeout);
        this.timers.set(key, timer);
      }
    });
  }

  private async processBatch(key: string, fetcher: (keys: string[]) => Promise<Map<string, T>>) {
    const requests = this.batch.get(key) || [];
    if (requests.length === 0) return;

    this.batch.delete(key);
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }

    try {
      const keys = requests.map((r) => r.key);
      const results = await fetcher(keys);

      requests.forEach((request) => {
        const result = results.get(request.key);
        if (result !== undefined) {
          request.resolver(result);
        } else {
          request.rejector(new Error(`No result for key: ${request.key}`));
        }
      });
    } catch (error) {
      requests.forEach((request) => {
        request.rejector(error as Error);
      });
    }
  }
}

// Create batch processors for different data types
export const userBatch = new BatchProcessor();
export const walletBatch = new BatchProcessor();
export const mixBatch = new BatchProcessor();

/**
 * Batch fetch users
 */
export async function batchFetchUsers(userIds: number[]): Promise<Map<number, any>> {
  const { getDb } = await import("../db");
  const db = await getDb();
  if (!db) {
    return new Map();
  }

  const { users } = await import("../../drizzle/schema");
  const { inArray } = await import("drizzle-orm");
  
  const results = await db
    .select()
    .from(users)
    .where(inArray(users.id, userIds));

  const map = new Map();
  results.forEach((user) => {
    map.set(user.id, user);
  });
  return map;
}
