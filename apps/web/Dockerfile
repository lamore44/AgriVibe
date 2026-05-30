# Stage 1: Install dependencies & build
FROM node:20-slim AS builder
WORKDIR /app

# Copy root configurations (since this is a monorepo workspace)
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json

# Install dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code
COPY apps/web apps/web

# Set environment variables for production build
ENV NODE_ENV=production

# Re-run build for Next.js web app
RUN npm run build --workspace=@agrivibe/web

# Stage 2: Runtime image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy necessary files for runner
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/next.config.ts

# Expose port
EXPOSE 8080

# Run Next.js server start
CMD ["npm", "run", "start", "--workspace=@agrivibe/web"]
