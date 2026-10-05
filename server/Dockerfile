FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src
RUN npm run build && mkdir -p dist/assets && cp -r src/assets/. dist/assets/ && npm prune --omit=dev

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache curl \
  && mkdir -p /app/uploads \
  && chown -R node:node /app

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:5000/api/ || exit 1

CMD ["node", "dist/index.js"]
