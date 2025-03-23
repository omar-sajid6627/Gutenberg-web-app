FROM node:20-alpine AS deps
WORKDIR /app
# .npmrc carries legacy-peer-deps, which npm ci needs to resolve
# react-wordcloud's pre-React-18 peer range.
COPY package.json package-lock.json* .npmrc ./
# `npm ci` needs the lockfile to match package.json. The build script used to
# run `npm install react-day-picker@9.6.4 --no-save` mid-build, which made the
# build network-dependent and non-reproducible — and the package was already a
# declared dependency at that version.
RUN npm ci --include=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8600
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
