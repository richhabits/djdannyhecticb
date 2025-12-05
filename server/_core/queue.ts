/**
 * Background Job Queue System
 * Handles async tasks like email sending, AI processing, etc.
 */

interface JobData {
  type: string;
  payload: any;
  priority?: number;
  delay?: number;
}

interface Job {
  id: string;
  data: JobData;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

class JobQueue {
  private queue: Job[] = [];
  private processing: boolean = false;
  private workers: Map<string, (data: any) => Promise<void>> = new Map();

  constructor() {
    this.startProcessor();
  }

  /**
   * Register a worker for a job type
   */
  register(type: string, worker: (data: any) => Promise<void>) {
    this.workers.set(type, worker);
  }

  /**
   * Add a job to the queue
   */
  async add(data: JobData): Promise<string> {
    const job: Job = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data,
      attempts: 0,
      maxAttempts: data.type === "email" ? 3 : 5,
      createdAt: new Date(),
    };

    // Insert based on priority (higher priority first)
    const priority = data.priority || 0;
    const insertIndex = this.queue.findIndex((j) => (j.data.priority || 0) < priority);
    
    if (insertIndex === -1) {
      this.queue.push(job);
    } else {
      this.queue.splice(insertIndex, 0, job);
    }

    return job.id;
  }

  /**
   * Process jobs from the queue
   */
  private async startProcessor() {
    if (this.processing) return;
    this.processing = true;

    while (true) {
      if (this.queue.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      const job = this.queue.shift();
      if (!job) continue;

      const worker = this.workers.get(job.data.type);
      if (!worker) {
        console.warn(`[Queue] No worker registered for job type: ${job.data.type}`);
        continue;
      }

      try {
        // Handle delay
        if (job.data.delay) {
          await new Promise((resolve) => setTimeout(resolve, job.data.delay));
        }

        await worker(job.data.payload);
        console.log(`[Queue] Job ${job.id} completed successfully`);
      } catch (error) {
        console.error(`[Queue] Job ${job.id} failed:`, error);
        job.attempts++;

        if (job.attempts < job.maxAttempts) {
          // Retry with exponential backoff
          const delay = Math.pow(2, job.attempts) * 1000;
          job.data.delay = delay;
          this.queue.push(job);
        } else {
          console.error(`[Queue] Job ${job.id} exceeded max attempts`);
          // Could send to dead letter queue here
        }
      }
    }
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      pending: this.queue.length,
      workers: this.workers.size,
    };
  }
}

export const jobQueue = new JobQueue();

// Register default workers
jobQueue.register("email", async (data) => {
  // Email sending logic
  console.log("[Queue] Processing email job:", data);
});

jobQueue.register("ai-process", async (data) => {
  // AI processing logic
  console.log("[Queue] Processing AI job:", data);
});

jobQueue.register("analytics", async (data) => {
  // Analytics processing
  console.log("[Queue] Processing analytics job:", data);
});

jobQueue.register("notification", async (data) => {
  // Notification sending
  console.log("[Queue] Processing notification job:", data);
});

// Helper function to add jobs
export async function enqueueJob(type: string, payload: any, options?: { priority?: number; delay?: number }) {
  return await jobQueue.add({
    type,
    payload,
    priority: options?.priority,
    delay: options?.delay,
  });
}
