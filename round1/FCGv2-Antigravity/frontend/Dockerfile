FROM node:20-bookworm as build

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies (ignoring peer deps to solve React/TS conflicts if any)
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Production Environment
FROM nginx:alpine

COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Copy custom nginx config if needed, or use default
# Expose port 80 (internal) mapped to 3000 in compose? 
# Compose maps 3000:3000, so we should expose 3000 or map 3000 to 80.
# Nginx default is 80.
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
