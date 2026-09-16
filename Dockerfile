FROM node:22-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS tooling
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .

FROM tooling AS builder
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# No DATABASE_URL or admin secret is passed to the image build.
RUN npm run lint && npm run typecheck && npm run test:run && npm run build

FROM base AS runner
ENV NODE_ENV=production PORT=3005 HOSTNAME=0.0.0.0 UPLOAD_DIR=/app/data/uploads
RUN mkdir -p /app/data/uploads && chown -R node:node /app/data
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/content ./content
COPY --from=builder --chown=node:node /app/scripts/validate-env.mjs ./scripts/validate-env.mjs
COPY --from=builder --chown=node:node /app/scripts/run-jobs.mjs ./scripts/run-jobs.mjs
USER node
EXPOSE 3005
CMD ["sh", "-c", "node scripts/validate-env.mjs && exec node server.js"]
