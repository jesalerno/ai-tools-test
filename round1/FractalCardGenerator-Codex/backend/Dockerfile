FROM node:20-bookworm-slim AS base

WORKDIR /app

COPY backend/package*.json ./backend/
COPY backend/tsconfig*.json ./backend/
COPY shared ./shared

WORKDIR /app/backend
RUN npm install

COPY backend/src ./src
COPY backend/test ./test

RUN npm run build

EXPOSE 8080
CMD ["npm", "run", "start"]
