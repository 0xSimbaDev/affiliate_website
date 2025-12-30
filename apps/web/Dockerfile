# syntax=docker/dockerfile:1

# ============================================
# Base stage: Node.js with pnpm
# ============================================
FROM node:20-alpine AS base

# Install dependencies for node-gyp and other native modules
RUN apk add --no-cache libc6-compat

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ============================================
# Dependencies stage: Install all dependencies
# ============================================
FROM base AS deps
WORKDIR /app

# Copy package files for dependency installation
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy all package.json files for workspace packages
COPY apps/web/package.json ./apps/web/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/database/package.json ./packages/database/
COPY packages/utils/package.json ./packages/utils/
COPY packages/api/package.json ./packages/api/
COPY packages/ui/package.json ./packages/ui/
COPY packages/layouts/package.json ./packages/layouts/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================
# Builder stage: Build the application
# ============================================
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/config/node_modules ./packages/config/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/packages/utils/node_modules ./packages/utils/node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY --from=deps /app/packages/layouts/node_modules ./packages/layouts/node_modules

# Copy all source files
COPY . .

# Accept DATABASE_URL as build arg for Prisma generate
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma client
RUN pnpm db:generate

# Generate domain mappings
RUN pnpm generate:domains || true

# Build the web application using Turborepo
RUN pnpm turbo build --filter=web

# ============================================
# Runner stage: Production runtime
# ============================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Set correct ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "apps/web/server.js"]
