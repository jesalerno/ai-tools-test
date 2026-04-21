FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install --force
COPY shared ./shared
COPY frontend ./frontend
RUN cd frontend && npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location = /index.html { \
        root /usr/share/nginx/html; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
        add_header Pragma "no-cache"; \
    } \
    location /assets/ { \
        root /usr/share/nginx/html; \
        add_header Cache-Control "public, max-age=31536000, immutable"; \
    } \
    location /api/ { \
        proxy_pass http://backend:8095; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
    } \
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
