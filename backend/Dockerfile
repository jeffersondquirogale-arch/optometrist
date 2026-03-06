# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias (incluidas dev para compilar TypeScript)
COPY package*.json ./
RUN npm ci

# Copiar código fuente y compilar
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm run prisma:generate
RUN npm run build

# ─── Stage 2: producción ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar artefactos de compilación y esquema Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Puerto por defecto (anulable con variable de entorno PORT)
EXPOSE 3000

# Arrancar el servidor compilado
CMD ["node", "dist/server.js"]
