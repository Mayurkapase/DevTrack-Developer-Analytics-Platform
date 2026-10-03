# =============================================================================
# DevTrack AI - Frontend Dockerfile
# Multi-Stage Build: Node.js 20 Alpine -> Nginx Alpine
# =============================================================================

# Stage 1: Build React SPA
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx Alpine
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
