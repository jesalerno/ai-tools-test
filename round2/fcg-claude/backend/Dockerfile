# syntax=docker/dockerfile:1.7

# --- Stage 1: build ---------------------------------------------------------
FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV NODE_ENV=development

COPY shared ./shared
COPY backend/package.json backend/package-lock.json ./backend/
WORKDIR /app/backend
RUN npm ci --no-audit --no-fund

COPY backend/tsconfig.json backend/tsconfig.test.json ./
COPY backend/src ./src
RUN npm run build && npm prune --omit=dev

# --- Stage 2: runtime -------------------------------------------------------
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

# Run as non-root (FCG-SPECv3 §6, ARCHITECTUREv2 §6).
RUN groupadd --system --gid 1001 fcg \
  && useradd --system --uid 1001 --gid fcg --home /app --shell /usr/sbin/nologin fcg

ENV NODE_ENV=production \
    PORT=8040 \
    BODY_SIZE_LIMIT_MB=2 \
    MAX_GENERATION_MS=15000 \
    MAX_CANVAS_MEMORY_BYTES=134217728 \
    RATE_LIMIT_WINDOW_MS=60000 \
    RATE_LIMIT_MAX=60 \
    CORS_ORIGIN=http://localhost:3040

COPY --from=build /app/backend/package.json ./package.json
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist

USER fcg:fcg
EXPOSE 8040

HEALTHCHECK --interval=15s --timeout=3s --start-period=8s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]
