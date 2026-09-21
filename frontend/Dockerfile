# ==============================================================================
# Multi-stage Dockerfile for Angular Frontend (Optimized for Google Cloud Run)
# ==============================================================================

# --- Stage 1: Build Angular Application ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx Alpine ---
FROM nginx:1.27-alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular files from builder stage
COPY --from=builder /app/dist/el-dugout-ve/browser /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Google Cloud Run default port is 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
