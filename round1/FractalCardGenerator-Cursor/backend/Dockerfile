FROM node:20-alpine

WORKDIR /app

# Install canvas dependencies and build tools
RUN apk add --no-cache \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    python3 \
    make \
    g++ \
    pkgconfig

COPY backend/package*.json ./
# Install all dependencies (including dev) for build
RUN npm ci

# Copy shared types first (needed for TypeScript compilation)
COPY shared ../shared
# Copy backend source code
COPY backend/ .
# Build TypeScript
RUN npm run build
# Compile shared/types.ts FIRST to dist/shared/types.js (before any file moving)
RUN if [ -f ../shared/types.ts ]; then \
      mkdir -p dist/shared && \
      npx tsc ../shared/types.ts --outDir dist/shared --module commonjs --target ES2020 --esModuleInterop --skipLibCheck --declaration false 2>&1 | head -5 && \
      echo "Shared types compiled to dist/shared/types.js" || \
      (echo "WARNING: Compiling shared types failed" && exit 1); \
    fi
# Fix: TypeScript outputs to dist/backend/src/, move files to dist/ root
# BUT preserve dist/shared/types.js (the actual shared types we just compiled)
RUN if [ -d dist/backend/src ]; then \
      if [ -f dist/shared/types.js ]; then \
        cp dist/shared/types.js /tmp/shared_types_backup.js; \
      fi && \
      rm -rf dist/backend && \
      if [ -f /tmp/shared_types_backup.js ]; then \
        mkdir -p dist/shared && \
        cp /tmp/shared_types_backup.js dist/shared/types.js && \
        rm /tmp/shared_types_backup.js; \
      fi && \
      echo "Preserved dist/shared/types.js"; \
    fi
# Verify the compiled shared types file exists and is correct
RUN test -f dist/shared/types.js && \
    grep -q "exports.FRACTAL_METHODS" dist/shared/types.js && \
    echo "SUCCESS: dist/shared/types.js is correct" || \
    (echo "ERROR: dist/shared/types.js is missing or incorrect" && exit 1)

# Rebuild canvas native module for the container's architecture
# This is necessary because canvas.node may have been built for a different architecture
RUN npm rebuild canvas --build-from-source || \
    (echo "Warning: canvas rebuild failed, trying reinstall" && \
     npm uninstall canvas && \
     npm install canvas --build-from-source)

# Remove dev dependencies after build
RUN npm prune --production

# Create a start script that finds the correct index.js location
RUN cat > /app/start.sh << 'EOF' && chmod +x /app/start.sh
#!/bin/sh
if [ -f dist/index.js ]; then
  exec node dist/index.js
elif [ -f dist/backend/src/index.js ]; then
  exec node dist/backend/src/index.js
elif [ -f dist/app/src/index.js ]; then
  exec node dist/app/src/index.js
elif [ -f dist/src/index.js ]; then
  exec node dist/src/index.js
else
  echo "Error: Could not find index.js in dist/"
  find dist -name "index.js"
  exit 1
fi
EOF

EXPOSE 8080

CMD ["sh", "/app/start.sh"]
