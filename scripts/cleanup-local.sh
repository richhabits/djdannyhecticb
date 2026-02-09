#!/bin/bash
set -e

echo "Cleaning up local environment..."

# Safe deletions only
rm -rf node_modules
rm -rf dist
rm -rf client/dist
rm -rf .next
rm -rf .vite
rm -rf .turbo
rm -rf logs
rm -rf pnpm-lock.yaml  # Optional, but sometimes needed for full reset

echo "Environment clean. Run 'pnpm install' to restore."
