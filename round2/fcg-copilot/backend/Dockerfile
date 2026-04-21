# Multi-stage build for backend
# Stage 1: Build
FROM node:20-alpine AS builder

# Install native build dependencies for @napi-rs/canvas
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev pixman-dev

WORKDIR /app

# Copy backend package files and install
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy source and compile
COPY src/ ./src/
COPY tsconfig.json ./
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runtime

# Install native runtime dependencies for @napi-rs/canvas
RUN apk add --no-cache cairo pango jpeg giflib librsvg pixman

# Create non-root user per spec §6 (ARCHITECTUREv2)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts

# Copy compiled output
COPY --from=builder /app/dist ./dist

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

CMD ["node", "dist/infrastructure/server.js"]
