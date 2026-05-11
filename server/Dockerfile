FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache \
    ca-certificates \
    chromium \
    freetype \
    harfbuzz \
    nss \
    ttf-freefont

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# =========================

FROM base AS dependencies

COPY package*.json ./

RUN PUPPETEER_SKIP_DOWNLOAD=true npm install

# =========================

FROM base AS development

ENV NODE_ENV=development

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

EXPOSE 8000

CMD ["npm", "run", "start:dev"]

# =========================

FROM base AS builder

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=2048

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npm run build
RUN npm prune --omit=dev

# =========================

FROM base AS production

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/database/data ./dist/database/data

EXPOSE 8000

CMD ["npm", "run", "start:prod"]
