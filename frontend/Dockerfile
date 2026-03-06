# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY src ./src

# VITE_API_URL puede pasarse como build-arg en producción
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ─── Stage 2: servidor nginx ──────────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Copiar los archivos estáticos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración nginx: redirige todas las rutas al index.html (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
