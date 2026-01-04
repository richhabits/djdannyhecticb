# Build stage for Frontend - optimized for size
FROM node:20-alpine AS build-client
WORKDIR /app

# Install pnpm only (minimal)
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy package files only
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install dependencies with cache mount to save space
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# Copy only what's needed for build
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY drizzle/ ./drizzle/
COPY components.json ./
COPY public/ ./public/
COPY vite.config.ts tsconfig.json tsconfig.node.json ./

# Build with production optimizations
ENV NODE_ENV=production
RUN pnpm run build && \
    rm -rf node_modules .pnpm-store && \
    find dist -name "*.map" -delete

# Production stage - minimal alpine image
FROM node:20-alpine
WORKDIR /app

# Install only essential tools
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/* /tmp/*

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install production dependencies only with cache
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile --prefer-offline && \
    pnpm store prune && \
    rm -rf /root/.local/share/pnpm/store/.tmp

# Copy built files only
COPY --from=build-client /app/dist ./dist

# Create minimal .env
RUN touch .env

# Final cleanup - remove everything unnecessary
RUN rm -rf /tmp/* /var/cache/apk/* /root/.npm /root/.cache && \
    find /app -name "*.map" -delete && \
    find /app -name "*.test.*" -delete && \
    find /app -name "*.spec.*" -delete && \
    find /app -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find /app -name "*.md" ! -name "README*" -delete 2>/dev/null || true

EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["pnpm", "start"]
