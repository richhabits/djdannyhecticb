/**
 * Load Testing Script for DJ Danny Hectic B
 * Tests performance under various concurrent user loads
 *
 * Usage: npx tsx scripts/load-test.ts --users 100 --duration 60
 */

import http from 'http';
import https from 'https';

interface LoadTestOptions {
  users: number;
  duration: number;
  rampUpTime: number;
  baseUrl: string;
  endpoints: string[];
}

interface TestResult {
  endpoint: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
}

class LoadTester {
  private options: LoadTestOptions;
  private results: Map<string, number[]> = new Map();
  private errors: Map<string, number> = new Map();
  private startTime: number = 0;
  private endTime: number = 0;

  constructor(options: LoadTestOptions) {
    this.options = {
      rampUpTime: 10,
      ...options,
    };
  }

  async run(): Promise<TestResult[]> {
    console.log(`
╔════════════════════════════════════════════════════╗
║  DJ Danny Hectic B - Load Test                    ║
║  Users: ${this.options.users} | Duration: ${this.options.duration}s | Ramp-up: ${this.options.rampUpTime}s
║  Base URL: ${this.options.baseUrl}
╚════════════════════════════════════════════════════╝
    `);

    this.startTime = Date.now();
    this.endTime = this.startTime + this.options.duration * 1000;

    // Initialize results tracking
    for (const endpoint of this.options.endpoints) {
      this.results.set(endpoint, []);
      this.errors.set(endpoint, 0);
    }

    // Ramp up users gradually
    const usersPerSecond = this.options.users / this.options.rampUpTime;
    let activeUsers = 0;

    console.log(`Starting load test with ${usersPerSecond.toFixed(1)} users/sec ramp-up rate...`);

    // Create user connections
    const userPromises: Promise<void>[] = [];
    for (let i = 0; i < this.options.users; i++) {
      const delay = (i / usersPerSecond) * 1000;
      userPromises.push(
        new Promise((resolve) => {
          setTimeout(() => {
            activeUsers++;
            this.simulateUser(i).finally(() => resolve());
          }, delay);
        })
      );
    }

    // Wait for all users to complete
    await Promise.all(userPromises);

    // Print results
    return this.printResults();
  }

  private async simulateUser(userId: number): Promise<void> {
    while (Date.now() < this.endTime) {
      const endpoint = this.options.endpoints[Math.floor(Math.random() * this.options.endpoints.length)];
      try {
        await this.makeRequest(endpoint);
      } catch (error) {
        const errorCount = this.errors.get(endpoint) || 0;
        this.errors.set(endpoint, errorCount + 1);
      }

      // Random think time between requests (100-500ms)
      const thinkTime = Math.random() * 400 + 100;
      await new Promise((resolve) => setTimeout(resolve, thinkTime));
    }
  }

  private makeRequest(endpoint: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const client = this.options.baseUrl.startsWith('https') ? https : http;

      const req = client.get(this.options.baseUrl + endpoint, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          const duration = Date.now() - startTime;
          const times = this.results.get(endpoint) || [];
          times.push(duration);
          this.results.set(endpoint, times);
          resolve(duration);
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(10000); // 10 second timeout
    });
  }

  private printResults(): TestResult[] {
    const testResults: TestResult[] = [];

    console.log(`
╔════════════════════════════════════════════════════╗
║  Load Test Results
╚════════════════════════════════════════════════════╝
    `);

    for (const [endpoint, times] of this.results) {
      const errorCount = this.errors.get(endpoint) || 0;
      const totalRequests = times.length + errorCount;
      const successfulRequests = times.length;
      const failedRequests = errorCount;

      // Calculate statistics
      const sorted = times.sort((a, b) => a - b);
      const average = sorted.reduce((a, b) => a + b, 0) / sorted.length || 0;
      const min = sorted[0] || 0;
      const max = sorted[sorted.length - 1] || 0;
      const p95Index = Math.floor(sorted.length * 0.95);
      const p99Index = Math.floor(sorted.length * 0.99);
      const p95 = sorted[p95Index] || 0;
      const p99 = sorted[p99Index] || 0;
      const testDuration = (this.endTime - this.startTime) / 1000;
      const rps = totalRequests / testDuration;
      const errorRate = (failedRequests / totalRequests) * 100 || 0;

      const result: TestResult = {
        endpoint,
        totalRequests,
        successfulRequests,
        failedRequests,
        averageResponseTime: Math.round(average),
        minResponseTime: min,
        maxResponseTime: max,
        p95ResponseTime: p95,
        p99ResponseTime: p99,
        requestsPerSecond: Math.round(rps * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100,
      };

      testResults.push(result);

      console.log(`
Endpoint: ${endpoint}
  Total Requests: ${totalRequests}
  Successful: ${successfulRequests} | Failed: ${failedRequests}
  Error Rate: ${errorRate.toFixed(2)}%

  Response Times:
    Average: ${Math.round(average)}ms
    Min: ${min}ms
    Max: ${max}ms
    P95: ${p95}ms
    P99: ${p99}ms

  Throughput: ${rps.toFixed(2)} requests/sec
      `);
    }

    console.log(`
╔════════════════════════════════════════════════════╗
║  Test Complete
╚════════════════════════════════════════════════════╝
    `);

    return testResults;
  }
}

// Parse command-line arguments
const args = process.argv.slice(2);
const options: Partial<LoadTestOptions> = {
  users: 100,
  duration: 60,
  baseUrl: 'http://localhost:3000',
  endpoints: ['/', '/api/health'],
};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace('--', '') as keyof LoadTestOptions;
  const value = args[i + 1];

  if (key === 'users' || key === 'duration' || key === 'rampUpTime') {
    (options[key] as any) = parseInt(value);
  } else if (key === 'baseUrl') {
    options.baseUrl = value;
  } else if (key === 'endpoints') {
    options.endpoints = value.split(',');
  }
}

// Run test
const tester = new LoadTester(options as LoadTestOptions);
tester.run().catch(console.error);
