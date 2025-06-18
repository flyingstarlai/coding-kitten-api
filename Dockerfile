# Build arguments for Bun and Node versions
ARG BUN_VERSION=1.2.16
ARG NODE_VERSION=22

# ----------
# Production stage
# ----------
FROM imbios/bun-node:${BUN_VERSION}-${NODE_VERSION}-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY bun.lock package.json prisma/schema.prisma ./

# Install all dependencies (skip lifecycle scripts) and generate Prisma client
RUN bun install --ignore-scripts

COPY src/ src/

# Expose application port and run migrations + server on start
EXPOSE 3000
CMD ["sh", "-c", "bun run src/index.ts"]