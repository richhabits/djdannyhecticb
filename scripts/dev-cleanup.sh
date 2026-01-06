#!/bin/bash

# scripts/dev-cleanup.sh
# Deep clean development environment

echo "🧹 Starting Deep Clean..."

# Clean node_modules
if [ -d "node_modules" ]; then
    echo "removing node_modules..."
    rm -rf node_modules
fi

if [ -d "client/node_modules" ]; then
    echo "removing client/node_modules..."
    rm -rf client/node_modules
fi

# Clean build artifacts
if [ -d "dist" ]; then
    echo "removing dist..."
    rm -rf dist
fi

if [ -d "client/dist" ]; then
    echo "removing client/dist..."
    rm -rf client/dist
fi

# Clean caches
echo "cleaning caches..."
rm -rf .vite
rm -rf client/.vite
rm -rf .turbo
rm -rf .cache

# Clean logs
echo "cleaning logs..."
rm -rf logs/*
rm -f *.log
rm -f npm-debug.log*
rm -f pnpm-debug.log*

echo "✨ Clean complete! Run 'npm install' or 'pnpm install' to reset."
