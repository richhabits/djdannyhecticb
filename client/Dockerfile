# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Production (Lightweight Static Server)
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Custom nginx config to handle SPA routing if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
