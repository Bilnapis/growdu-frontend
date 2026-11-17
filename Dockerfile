FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN node --input-type=module -e "const url = new URL(process.env.VITE_API_BASE_URL); if (url.protocol !== 'https:') throw new Error('VITE_API_BASE_URL must be an absolute HTTPS URL')" \
    && npm run build

FROM caddy:2-alpine AS runtime
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 80 443
