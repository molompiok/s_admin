# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps

WORKDIR /app

# Copier uniquement les fichiers de gestion des dépendances
COPY package.json pnpm-lock.yaml ./

# Installer PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

# Installer les dépendances (y compris dev pour le build)
RUN pnpm install --frozen-lockfile

# ---- Stage 2: Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copier le code source
COPY . .

# Build de l'application (Vike)
RUN npm run build

# ---- Stage 3: Runtime ----
FROM node:20-alpine AS runtime

WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Installer PNPM et les dépendances de prod uniquement
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --prod --frozen-lockfile

# Installer curl/wget pour healthcheck si besoin
RUN apk add --no-cache curl wget

# Permissions
RUN chown -R appuser:appgroup /app

USER appuser

# Port par défaut (peut être surchargé)
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --spider http://localhost:${PORT}/health || exit 1

# Commande de démarrage
CMD ["node", "./dist/server/index.mjs"]
