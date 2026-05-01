#!/usr/bin/env node

/**
 * Performance Report Generator
 * Analyzes bundle size and performance metrics
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const distPath = path.join(__dirname, '../dist/public');
const budgetPath = path.join(__dirname, '../client/performance-budget.json');

let totalSize = 0;
let totalGzipSize = 0;
const fileStats = [];

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function getGzipSize(filePath) {
  const content = fs.readFileSync(filePath);
  return zlib.gzipSync(content).length;
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (!file.startsWith('.')) {
      const size = getFileSize(filePath);
      const gzipSize = getGzipSize(filePath);
      const ext = path.extname(file);

      totalSize += size;
      totalGzipSize += gzipSize;

      fileStats.push({
        file: file,
        path: filePath.replace(distPath, ''),
        size,
        gzipSize,
        ext,
        ratio: ((gzipSize / size) * 100).toFixed(1),
      });
    }
  });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

function loadBudget() {
  if (!fs.existsSync(budgetPath)) return null;
  return JSON.parse(fs.readFileSync(budgetPath, 'utf8'));
}

function checkBudget(stats, budget) {
  const issues = [];

  for (const bundle of budget.bundles) {
    const matchingFiles = stats.filter((f) => f.file.includes(bundle.name));
    const bundleSize = matchingFiles.reduce((sum, f) => sum + f.gzipSize, 0);
    const maxBytes = parseFloat(bundle.maxSize) * 1024;

    if (bundleSize > maxBytes) {
      issues.push({
        type: 'BUDGET_EXCEEDED',
        bundle: bundle.name,
        current: formatBytes(bundleSize),
        limit: bundle.maxSize,
        over: formatBytes(bundleSize - maxBytes),
      });
    }
  }

  return issues;
}

function printReport() {
  if (!fs.existsSync(distPath)) {
    console.error('Build directory not found:', distPath);
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('📊 PERFORMANCE REPORT');
  console.log('========================================\n');

  walkDir(distPath);

  // Sort files by gzip size
  fileStats.sort((a, b) => b.gzipSize - a.gzipSize);

  // Summary
  console.log('BUNDLE SUMMARY');
  console.log('──────────────────────────────────────');
  console.log(`Total size:     ${formatBytes(totalSize)}`);
  console.log(`Gzipped size:   ${formatBytes(totalGzipSize)}`);
  console.log(`Compression:    ${((totalGzipSize / totalSize) * 100).toFixed(1)}%`);
  console.log('');

  // Top 10 largest files
  console.log('TOP 10 LARGEST FILES (Gzipped)');
  console.log('──────────────────────────────────────');
  fileStats.slice(0, 10).forEach((file, idx) => {
    console.log(`${idx + 1}. ${file.file}`);
    console.log(`   Size: ${formatBytes(file.size)} (Gzipped: ${formatBytes(file.gzipSize)})`);
    console.log(`   Ratio: ${file.ratio}%`);
  });
  console.log('');

  // File type breakdown
  const byExt = {};
  fileStats.forEach((file) => {
    const ext = file.ext || 'unknown';
    if (!byExt[ext]) {
      byExt[ext] = { size: 0, gzipSize: 0, count: 0 };
    }
    byExt[ext].size += file.size;
    byExt[ext].gzipSize += file.gzipSize;
    byExt[ext].count += 1;
  });

  console.log('FILE TYPE BREAKDOWN');
  console.log('──────────────────────────────────────');
  Object.entries(byExt)
    .sort((a, b) => b[1].gzipSize - a[1].gzipSize)
    .forEach(([ext, stats]) => {
      console.log(`${ext || 'no ext'}`);
      console.log(`  Count: ${stats.count}`);
      console.log(`  Size: ${formatBytes(stats.size)} (Gzipped: ${formatBytes(stats.gzipSize)})`);
    });
  console.log('');

  // Performance budget check
  const budget = loadBudget();
  if (budget) {
    console.log('PERFORMANCE BUDGET CHECK');
    console.log('──────────────────────────────────────');
    const issues = checkBudget(fileStats, budget);

    if (issues.length === 0) {
      console.log('✅ All bundles within performance budget!');
    } else {
      console.log('❌ Performance budget exceeded:');
      issues.forEach((issue) => {
        console.log(`  - ${issue.bundle}: ${issue.current} (limit: ${issue.limit})`);
        console.log(`    Over by: ${issue.over}`);
      });
    }
    console.log('');
  }

  // Recommendations
  console.log('OPTIMIZATION RECOMMENDATIONS');
  console.log('──────────────────────────────────────');
  const largestFile = fileStats[0];
  if (largestFile.gzipSize > 100 * 1024) {
    console.log(`⚠️  Consider code-splitting ${largestFile.file}`);
  }

  const cssFiles = fileStats.filter((f) => f.ext === '.css');
  if (cssFiles.length > 0) {
    const cssSize = cssFiles.reduce((sum, f) => sum + f.gzipSize, 0);
    if (cssSize > 50 * 1024) {
      console.log('⚠️  CSS bundle is large, consider:');
      console.log('    - Using CSS-in-JS for component styles');
      console.log('    - Removing unused CSS (PurgeCSS)');
    }
  }

  console.log('✨ Enable Brotli compression on your server for better compression');
  console.log('✨ Use a CDN for static assets');
  console.log('✨ Enable image optimization (WebP, lazy loading)');
  console.log('\n========================================\n');
}

printReport();
