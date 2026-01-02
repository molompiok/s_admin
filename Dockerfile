# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder


WORKDIR /app

# Installe pnpm globalement
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm build



ENV NODE_ENV=production
ENV PORT=3008
ENV REDIS_HOST=sublymus_infra_redis
ENV SERVICE_ID=s_admin
ENV TARGET_API_HEADER=x-target-api-service 
ENV STORE_URL_HEADER=x-base-url
ENV SERVER_URL_HEADER=x-server-url


HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:${PORT}/health || exit 1

EXPOSE 3008

CMD ["pnpm", "run", "server:prod"]
