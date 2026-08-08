# Etapa 1: Compilador Node.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm run build

# Etapa 2: Servidor de producción Nginx Alpine (Consumo: 5MB RAM)
FROM nginx:alpine
RUN echo $'server {\n\
    listen 80;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
