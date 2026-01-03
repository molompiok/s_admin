# ---- Stage 1: Dependencies ----
FROM node:20-alpine AS deps

WORKDIR /app

# Copier uniquement les fichiers de gestion des dépendances
COPY package.json pnpm-lock.yaml ./

# Installer PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

# Installer UNIQUEMENT les dépendances de production d'abord pour profiter du cache
RUN pnpm install --prod --frozen-lockfile

# ---- Stage 2: Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

# Argument de build pour l'URL de l'API
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copier les dépendances de production installées au stage précédent
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Installer PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

# Installer TOUTES les dépendances (incluant devDependencies pour le build)
RUN pnpm install --frozen-lockfile

# Copier le reste du code source de l'application
COPY . .

# Build de l'application Vike/Vite
# La commande `build` compile TypeScript et génère les fichiers dans dist/
RUN pnpm build

# ---- Stage 3: Runtime ----
FROM node:20-alpine AS runtime

WORKDIR /app

# Créer un utilisateur non-root et un groupe
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copier les fichiers nécessaires depuis le stage builder
# On copie le dossier `dist` qui contient le code compilé
COPY --from=builder /app/dist ./dist

# Copier package.json et pnpm-lock.yaml pour installer les dépendances de production uniquement
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Installer PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

# Installer UNIQUEMENT les dépendances de production
RUN pnpm install --prod --frozen-lockfile

# Changer le propriétaire des fichiers de l'application
RUN chown -R appuser:appgroup /app

# Passer à l'utilisateur non-root
USER appuser

# Exposer le port (sera défini par la variable d'environnement PORT)
ENV PORT=3008

# Variables d'environnement par défaut (peuvent être surchargées)
ENV HOST=0.0.0.0
ENV NODE_ENV=production

HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --quiet --spider http://0.0.0.0:${PORT:-3008}/health || exit 1

EXPOSE ${PORT:-3008}

# Commande pour démarrer l'application de production
CMD ["node", "./dist/server/index.mjs"]

