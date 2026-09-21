# ==============================================================================
# Multi-stage Dockerfile for NestJS Backend (Optimized for Google Cloud Run)
# ==============================================================================

# --- Stage 1: Dependencies ---
FROM node:22-alpine AS dependencies
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# --- Stage 2: Builder ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client code
RUN npx prisma generate

# Build TypeScript to production JavaScript (dist/)
RUN npm run build

# Prune devDependencies to keep final image slim
RUN npm prune --production

# --- Stage 3: Runner ---
FROM node:22-alpine AS runner
WORKDIR /app

# Security: run as unprivileged user
ENV NODE_ENV=production
ENV PORT=8080

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Copy artifacts from previous stages
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

USER nestjs

EXPOSE 8080

# Start production server
CMD ["node", "dist/main.js"]
