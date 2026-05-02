/**
 * Performance Setup Validation Script
 * Verifies all optimization components are in place
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const projectRoot = process.cwd();

interface ValidationResult {
  component: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
  details?: string;
}

const results: ValidationResult[] = [];

// Helper functions
function checkFile(filePath: string, description: string): boolean {
  const fullPath = path.join(projectRoot, filePath);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    results.push({
      component: description,
      status: 'PASS',
      message: `✅ ${filePath} exists`,
    });
  } else {
    results.push({
      component: description,
      status: 'FAIL',
      message: `❌ ${filePath} missing`,
    });
  }

  return exists;
}

function checkFileContent(filePath: string, searchStr: string, description: string): boolean {
  const fullPath = path.join(projectRoot, filePath);
  if (!fs.existsSync(fullPath)) {
    results.push({
      component: description,
      status: 'FAIL',
      message: `❌ File not found: ${filePath}`,
    });
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const found = content.includes(searchStr);

  if (found) {
    results.push({
      component: description,
      status: 'PASS',
      message: `✅ ${description} configured`,
    });
  } else {
    results.push({
      component: description,
      status: 'FAIL',
      message: `❌ ${description} not found in ${filePath}`,
    });
  }

  return found;
}

function checkPackage(packageName: string): boolean {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
    const found = packageJson.dependencies[packageName] || packageJson.devDependencies[packageName];

    if (found) {
      results.push({
        component: packageName,
        status: 'PASS',
        message: `✅ ${packageName} installed`,
        details: found,
      });
    } else {
      results.push({
        component: packageName,
        status: 'FAIL',
        message: `❌ ${packageName} not in package.json`,
      });
    }

    return !!found;
  } catch {
    results.push({
      component: packageName,
      status: 'FAIL',
      message: `❌ Error reading package.json`,
    });
    return false;
  }
}

console.log(`
╔════════════════════════════════════════════════════╗
║  Performance Optimization Setup Validation
║  DJ Danny Hectic B
╚════════════════════════════════════════════════════╝
`);

console.log('🔍 Validating implementation...\n');

// ============================================================================
// PHASE 1: Database Indexes
// ============================================================================
console.log('PHASE 1: Database Indexes');
console.log('─'.repeat(50));

checkFile('drizzle/0010_performance_critical_indexes.sql', 'Index Migration');
checkFileContent('drizzle/0010_performance_critical_indexes.sql', 'idx_users_email', 'Email Index');
checkFileContent('drizzle/0010_performance_critical_indexes.sql', 'idx_event_bookings_status_created', 'Booking Index');
checkFileContent('drizzle/0010_performance_critical_indexes.sql', 'ANALYZE', 'Statistics Update');

console.log();

// ============================================================================
// PHASE 2: Redis Caching
// ============================================================================
console.log('PHASE 2: Redis Caching Layer');
console.log('─'.repeat(50));

checkFile('server/_core/cache/redis-client.ts', 'Redis Client');
checkFile('server/_core/cache/cache-keys.ts', 'Cache Keys');
checkFile('server/_core/cache/cache-manager.ts', 'Cache Manager');
checkFile('server/_core/cache/http-cache-middleware.ts', 'Cache Middleware');

// Check implementation details
checkFileContent('server/_core/cache/redis-client.ts', 'initializeRedis', 'Redis Initialization');
checkFileContent('server/_core/cache/cache-manager.ts', 'getOrCompute', 'Cache-Aside Pattern');
checkFileContent('server/_core/cache/cache-keys.ts', 'CACHE_TTL', 'TTL Configuration');

console.log();

// ============================================================================
// PHASE 3: Monitoring
// ============================================================================
console.log('PHASE 3: Monitoring & Observability');
console.log('─'.repeat(50));

checkFile('server/_core/monitoring/core-web-vitals.ts', 'Core Web Vitals');
checkFileContent('server/_core/monitoring/core-web-vitals.ts', 'CWV_THRESHOLDS', 'CWV Thresholds');
checkFileContent('server/_core/monitoring/core-web-vitals.ts', 'performanceMonitoringMiddleware', 'Monitoring Middleware');

console.log();

// ============================================================================
// Server Integration
// ============================================================================
console.log('Server Integration');
console.log('─'.repeat(50));

checkFileContent('server/_core/index.ts', 'initializeRedis', 'Redis Initialization');
checkFileContent('server/_core/index.ts', 'performanceMonitoringMiddleware', 'Monitoring Middleware');

console.log();

// ============================================================================
// Dependencies
// ============================================================================
console.log('Dependencies');
console.log('─'.repeat(50));

checkPackage('redis');
checkPackage('express');
checkPackage('drizzle-orm');

console.log();

// ============================================================================
// Documentation
// ============================================================================
console.log('Documentation');
console.log('─'.repeat(50));

checkFile('PERFORMANCE_BASELINE.md', 'Performance Baseline');
checkFile('DEPLOYMENT_GUIDE.md', 'Deployment Guide');
checkFile('IMPLEMENTATION_SUMMARY.md', 'Implementation Summary');
checkFile('scripts/load-test.ts', 'Load Testing Script');
checkFile('scripts/performance-queries.sql', 'Performance Queries');

console.log();

// ============================================================================
// Print Summary
// ============================================================================
const passed = results.filter(r => r.status === 'PASS').length;
const warnings = results.filter(r => r.status === 'WARN').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const total = results.length;

console.log('═'.repeat(50));
console.log('VALIDATION SUMMARY');
console.log('═'.repeat(50));
console.log(`
✅ Passed:  ${passed}/${total}
⚠️  Warnings: ${warnings}/${total}
❌ Failed:  ${failed}/${total}
`);

// Print details for failures
if (failed > 0) {
  console.log('FAILED ITEMS:');
  console.log('─'.repeat(50));
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`${r.message}`);
    if (r.details) console.log(`   ${r.details}`);
  });
  console.log();
}

// Print warnings
if (warnings > 0) {
  console.log('WARNINGS:');
  console.log('─'.repeat(50));
  results.filter(r => r.status === 'WARN').forEach(r => {
    console.log(`${r.message}`);
    if (r.details) console.log(`   ${r.details}`);
  });
  console.log();
}

// ============================================================================
// Status & Next Steps
// ============================================================================
console.log('STATUS & NEXT STEPS');
console.log('═'.repeat(50));

if (failed === 0) {
  console.log(`
✅ All components verified!

Next steps:

1. Set up Redis infrastructure:
   • Development: docker-compose up redis
   • Production: AWS ElastiCache

2. Configure environment variables:
   • REDIS_HOST=redis.internal
   • REDIS_PORT=6379
   • REDIS_PASSWORD=***

3. Apply database indexes:
   • pnpm db:push
   • Or: psql < drizzle/0010_performance_critical_indexes.sql

4. Run load tests:
   • npx tsx scripts/load-test.ts --users 100 --duration 60

5. Monitor performance:
   • psql -c '\\i scripts/performance-queries.sql'
   • redis-cli INFO stats
  `);
} else {
  console.log(`
❌ Some components missing!

Please verify:
${results.filter(r => r.status === 'FAIL').map(r => `  - ${r.message}`).join('\n')}

Refer to IMPLEMENTATION_SUMMARY.md for details.
  `);
}

// Exit code
process.exit(failed > 0 ? 1 : 0);
