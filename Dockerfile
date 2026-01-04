# Build stage for Frontend
FROM node:20-alpine AS build-client
WORKDIR /app

# Install pnpm (use cache mount for faster builds)
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy package files and patches (needed for pnpm)
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy only what's needed for build
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY drizzle/ ./drizzle/
COPY components.json ./
COPY public/ ./public/
COPY vite.config.ts tsconfig.json tsconfig.node.json ./

# Build
RUN pnpm run build

# Production stage - use slim image to save space
FROM node:20-alpine
WORKDIR /app

# Install only pnpm (no dev tools)
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate && \
    apk add --no-cache dumb-init

# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile && \
    pnpm store prune

# Copy built files
COPY --from=build-client /app/dist ./dist
# Create empty .env if .env.example doesn't exist
RUN touch .env

# Remove unnecessary files to save space
RUN rm -rf /tmp/* /var/cache/apk/* /root/.npm /root/.cache /root/.local/share/pnpm/store && \
    find /app -name "*.map" -delete && \
    find /app -name "*.test.*" -delete && \
    find /app -name "*.spec.*" -delete

EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["pnpm", "start"]
