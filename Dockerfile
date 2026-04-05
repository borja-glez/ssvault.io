FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./

FROM base AS deps

RUN pnpm install --frozen-lockfile --ignore-scripts=false

FROM deps AS build

COPY . .

RUN pnpm build

FROM base AS prod-deps

RUN pnpm install --frozen-lockfile --ignore-scripts=false --prod

FROM node:24-alpine AS production

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=prod-deps /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "./dist/server/entry.mjs"]
