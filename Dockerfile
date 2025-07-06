FROM oven/bun:1.2.16-alpine AS builder

WORKDIR /app

COPY package.json package.json
COPY bun.lock bun.lock

RUN bun install --ignore-scripts

COPY ./src ./src
COPY ./prisma/schema.prisma ./prisma/schema.prisma

RUN bun prisma generate

RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile server \
    ./src/index.ts


FROM oven/bun:1.2.16-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
COPY --from=builder /app/src/generated/   src/generated/
COPY --from=builder /app/server           server

CMD ["./server"]

EXPOSE 3000