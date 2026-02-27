# Frontend Dockerfile - Multi-stage build
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY craco.config.js ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY public ./public
COPY src ./src
COPY tsconfig.json ./

# Build application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
