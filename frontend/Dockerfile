FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar archivos fuente
COPY . .

# Inyectar variables de entorno para Vite en tiempo de construcción
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Construir para producción (TypeScript y Vite)
RUN npm run build

# Etapa Servidor Web (Nginx)
FROM nginx:alpine AS runner

# Copiar los assets compilados al directorio de html público
COPY --from=builder /app/dist /usr/share/nginx/html

# Configurar Nginx para soportar enrutamiento tipo SPA (React Router)
RUN rm /etc/nginx/conf.d/default.conf
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
