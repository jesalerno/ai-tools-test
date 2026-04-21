# syntax=docker/dockerfile:1.7

# --- Stage 1: build the SPA -------------------------------------------------
FROM node:20-bookworm-slim AS build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY frontend/tsconfig.json frontend/vite.config.ts frontend/index.html ./
COPY frontend/src ./src
RUN npm run build

# --- Stage 2: serve with Nginx ---------------------------------------------
# nginxinc/nginx-unprivileged is the official non-root Nginx image.
# It listens on 8080 by default; we override to 3040 via our server block
# and make all required paths owned by the `nginx` user.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

USER root
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html \
  && chown -R nginx:nginx /var/cache/nginx /var/log/nginx \
  && touch /tmp/nginx.pid \
  && chown nginx:nginx /tmp/nginx.pid

# Redirect PID file into /tmp (writable by non-root nginx).
RUN sed -i 's#^pid .*#pid /tmp/nginx.pid;#' /etc/nginx/nginx.conf

USER nginx
EXPOSE 3040

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3040/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
