FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el código y construir
COPY . .
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar solo dependencias de producción para mantener la imagen ligera
COPY package*.json ./
RUN npm ci --only=production

# Copiar la build generada
COPY --from=builder /app/dist ./dist

# Variables de entorno predeterminadas (sobre-escribibles por docker-compose)
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# Punto de entrada
CMD ["npm", "start"]
