FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*
COPY backend/package*.json ./backend/
RUN cd backend && npm install --force
COPY shared ./shared
COPY backend ./backend
RUN cd backend && npm run build

FROM node:20-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/backend/package*.json ./backend/
RUN cd backend && npm install --production --force
COPY --from=builder /app/backend/dist ./backend/dist
WORKDIR /app/backend
CMD ["npm", "start"]
