FROM node:23-alpine3.20 AS builder

# Set up environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml turbo.json tsconfig.base.json ./

# Copy package.json files for all workspaces to leverage layer caching
COPY apps/curriculum/package.json ./apps/curriculum/
COPY apps/training-management/package.json ./apps/training-management/
COPY packages/auth/package.json ./packages/auth/
COPY packages/roles/package.json ./packages/roles/
COPY packages/training-components/package.json ./packages/training-components/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build all packages
RUN pnpm run build

# Production image for curriculum app
FROM node:23-alpine3.20 AS curriculum

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/apps/curriculum/next.config.js ./
COPY --from=builder /app/apps/curriculum/package.json ./
COPY --from=builder /app/apps/curriculum/public ./public
COPY --from=builder /app/apps/curriculum/.next/standalone ./
COPY --from=builder /app/apps/curriculum/.next/static ./apps/curriculum/.next/static

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "apps/curriculum/server.js"]

# Production image for training management app
FROM node:23-alpine3.20 AS training-management

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/apps/training-management/next.config.js ./
COPY --from=builder /app/apps/training-management/package.json ./
COPY --from=builder /app/apps/training-management/public ./public
COPY --from=builder /app/apps/training-management/.next/standalone ./
COPY --from=builder /app/apps/training-management/.next/static ./apps/training-management/.next/static

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

CMD ["node", "apps/training-management/server.js"]
