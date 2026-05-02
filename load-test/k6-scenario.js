/**
 * Load Testing Scenario for DJ Danny Hectic B
 * Run with: k6 run load-test/k6-scenario.js
 *
 * Simulates realistic user behavior across all major endpoints
 * Tests database performance under load
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 500 },   // Ramp up to 500 users
    { duration: '10m', target: 1000 }, // Ramp up to 1000 users
    { duration: '5m', target: 5000 },  // Peak: 5000 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.1'],                   // Error rate < 10%
    'http_req_duration{staticAsset:yes}': ['p(95)<300'], // Static assets < 300ms
    'http_req_duration{api:yes}': ['p(95)<400'],     // API endpoints < 400ms
    'http_req_duration{chat:yes}': ['p(95)<200'],    // Chat < 200ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://djdannyhecticb.com';
const API_URL = `${BASE_URL}/api/trpc`;

// Test data
const sessionIds = [1, 2, 3, 4, 5];
const userIds = [...Array(100).keys()].map(i => i + 1);

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export default function testScenario() {
  // Test 1: Load homepage and static assets
  group('Static Assets', () => {
    const res = http.get(BASE_URL, {
      tags: { staticAsset: 'yes' },
    });

    check(res, {
      'homepage loads': (r) => r.status === 200,
      'homepage is fast': (r) => r.timings.duration < 3000,
    });
  });

  sleep(1);

  // Test 2: Get live session information
  group('Get Live Sessions', () => {
    const res = http.get(
      `${API_URL}?batch=1&input={"0":{"json":null,"meta":{"values":["undefined"]}}}`,
      {
        tags: { api: 'yes', endpoint: 'liveSessions' },
      }
    );

    check(res, {
      'get sessions status ok': (r) => r.status === 200,
      'get sessions is fast': (r) => r.timings.duration < 200,
    });
  });

  sleep(1);

  // Test 3: Get chat messages (high traffic)
  group('Get Chat Messages', () => {
    const sessionId = getRandomItem(sessionIds);
    const res = http.get(
      `${API_URL}?batch=1&input={"0":{"json":{"liveSessionId":${sessionId},"limit":50,"offset":0}}}`,
      {
        tags: { api: 'yes', chat: 'yes' },
      }
    );

    check(res, {
      'get chat messages ok': (r) => r.status === 200,
      'chat load time < 200ms': (r) => r.timings.duration < 200,
      'chat has content': (r) => r.body.length > 50,
    });
  });

  sleep(0.5);

  // Test 4: Get reactions (multiple rapid requests)
  group('Get Reactions', () => {
    const sessionId = getRandomItem(sessionIds);
    const res = http.get(
      `${API_URL}?batch=1&input={"0":{"json":{"liveSessionId":${sessionId}}}}`,
      {
        tags: { api: 'yes', reactions: 'yes' },
      }
    );

    check(res, {
      'get reactions ok': (r) => r.status === 200,
      'reactions load time < 150ms': (r) => r.timings.duration < 150,
    });
  });

  sleep(0.5);

  // Test 5: Get donations (payment data)
  group('Get Donations', () => {
    const sessionId = getRandomItem(sessionIds);
    const res = http.get(
      `${API_URL}?batch=1&input={"0":{"json":{"liveSessionId":${sessionId},"limit":25}}}`,
      {
        tags: { api: 'yes', donations: 'yes' },
      }
    );

    check(res, {
      'get donations ok': (r) => r.status === 200,
      'donations load time < 250ms': (r) => r.timings.duration < 250,
    });
  });

  sleep(1);

  // Test 6: Get leaderboard
  group('Get Leaderboard', () => {
    const res = http.get(
      `${API_URL}?batch=1&input={"0":{"json":{"limit":100}}}`,
      {
        tags: { api: 'yes', leaderboard: 'yes' },
      }
    );

    check(res, {
      'get leaderboard ok': (r) => r.status === 200,
      'leaderboard load time < 300ms': (r) => r.timings.duration < 300,
    });
  });

  sleep(2);

  // Test 7: Get user notifications (simulates real-time polling)
  group('Get Notifications', () => {
    const userId = getRandomItem(userIds);
    const res = http.get(
      `${API_URL}?batch=1&input={"0":{"json":{"userId":${userId},"limit":20}}}`,
      {
        tags: { api: 'yes', notifications: 'yes' },
      }
    );

    check(res, {
      'get notifications ok': (r) => r.status === 200,
      'notifications load time < 200ms': (r) => r.timings.duration < 200,
    });
  });

  sleep(1);

  // Test 8: Get user stats
  group('Get User Stats', () => {
    const userId = getRandomItem(userIds);
    const res = http.get(
      `${API_URL}?batch=1&input={"0":{"json":{"userId":${userId}}}}`,
      {
        tags: { api: 'yes', stats: 'yes' },
      }
    );

    check(res, {
      'get stats ok': (r) => r.status === 200,
      'stats load time < 150ms': (r) => r.timings.duration < 150,
    });
  });

  sleep(1);
}

/**
 * Custom metrics and thresholds
 */
export const metrics = {
  chatLoadTime: new Trend('chat_load_time'),
  reactionLoadTime: new Trend('reaction_load_time'),
  donationLoadTime: new Trend('donation_load_time'),
  leaderboardLoadTime: new Trend('leaderboard_load_time'),
  apiErrorRate: new Rate('api_errors'),
};
