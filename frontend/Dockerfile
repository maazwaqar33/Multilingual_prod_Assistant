# TodoEvolve Frontend Dockerfile (Standard Mode)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps
COPY . .

# Environment
ENV NEXT_PUBLIC_API_URL=http://todoevolve-api.centralindia.cloudapp.azure.com
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# CREATE USER FIRST
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# COPY FILES (Standard Next.js Layout)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
