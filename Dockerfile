# syntax=docker/dockerfile:1

# EventFlow: one Dockerfile, two images.
#   docker build --target api -t eventflow-api .   Express API (Node 22)
#   docker build --target web -t eventflow-web .   React build served by nginx
# docker-compose.yml builds both and adds PostgreSQL.

ARG NODE_VERSION=22
ARG NGINX_VERSION=1.28

# ---------- base: Node with npm, no lifecycle-script surprises ----------
FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app
ENV HUSKY=0 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

# ---------- deps: every workspace's dependencies, for building ----------
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
# --ignore-scripts: no install hooks run (husky, etc.); none are needed to
# build. The cache mount keeps the npm cache out of the image.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts

# ---------- build: compile the API and bundle the web app ----------
FROM deps AS build
COPY apps/api apps/api
COPY apps/web apps/web
RUN npm run build -w apps/api && npm run build -w apps/web

# ---------- api-deps: production dependencies of the API only ----------
FROM base AS api-deps
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts --workspace apps/api \
 && mkdir -p apps/api/node_modules

# ---------- api: the runtime image ----------
FROM node:${NODE_VERSION}-bookworm-slim AS api
ENV NODE_ENV=production \
    PORT=4000 \
    UPLOAD_DIR=/app/apps/api/uploads
WORKDIR /app/apps/api
# Same layout as the repo, so Node finds the hoisted /app/node_modules.
COPY --from=api-deps --chown=node:node /app/node_modules /app/node_modules
COPY --from=api-deps --chown=node:node /app/apps/api/node_modules ./node_modules
COPY --from=build --chown=node:node /app/apps/api/dist ./dist
COPY --chown=node:node apps/api/package.json ./package.json
COPY --chmod=755 docker/api-entrypoint.sh /usr/local/bin/api-entrypoint
RUN mkdir -p /app/apps/api/uploads /app/secrets \
 && chown node:node /app/apps/api/uploads /app/secrets
USER node
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
ENTRYPOINT ["api-entrypoint"]

# ---------- web: static files + reverse proxy to the API ----------
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION}-alpine AS web
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/healthz"]
