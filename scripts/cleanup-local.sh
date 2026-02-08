#!/bin/bash
# DJ Danny Hectic B / Hectic Empire - Local Hygiene Script
# Reclaims disk space by removing reinstallable build artifacts and caches.

echo "🚀 Initiating Hectic Local Hygiene..."

# 1. Remove build artifacts and caches
echo "🧹 Removing build artifacts and caches..."
rm -rf dist build .next .nuxt out coverage .turbo .cache .vite .rpt2_cache .rts2_cache_* .eslintcache *.tsbuildinfo .nyc_output

# 2. Kill node_modules for a fresh start (optional, uncomment if requested)
# echo "💀 Nuking node_modules..."
# rm -rf node_modules

# 3. PNPM Store cleanup (if applicable)
if command -v pnpm &> /dev/null
then
    echo "📦 Pruning PNPM store..."
    pnpm store prune
fi

# 4. OS Specific Junk
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Cleaning macOS junk..."
    find . -name ".DS_Store" -depth -exec rm {} \;
fi

echo "✅ Hygiene Complete. System optimized."
