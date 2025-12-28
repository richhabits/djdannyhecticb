# Build stage for Frontend
FROM node:20-alpine AS build-client
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Build stage for Backend (if needed, but usually it's just TS)
# The current setup seems to run both from the same package.

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production --legacy-peer-deps
COPY --from=build-client /app/dist ./dist
COPY --from=build-client /app/.env.example ./.env

EXPOSE 3000

CMD ["npm", "start"]
