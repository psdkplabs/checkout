FROM oven/bun:1-alpine
ARG BUILD_MODE=internal
WORKDIR /app
COPY package.json ./
RUN bun install
USER bun
CMD ["echo", "Aplikasi Trial Berjalan"]