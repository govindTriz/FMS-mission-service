# syntax=docker/dockerfile:1

# --- Builder ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=optional

# Copy source
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client and build TS
RUN npx prisma generate
RUN npm run build

# --- Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Only runtime files
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --omit=optional

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose default port
EXPOSE 3000

# Healthcheck (expects /healthz)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/healthz || exit 1

CMD ["node", "dist/index.js"]
