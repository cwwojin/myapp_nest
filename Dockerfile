FROM node:18.20.4-alpine3.20 AS base

# Local Timezone - Seoul (UTC+09)
ENV TZ=Asia/Seoul
RUN apk add tzdata &&\
    ln -s /usr/share/zoneinfo/Asia/Seoul /etc/localtime &&\
    echo "Asia/Seoul" > /etc/timezone \
    apk del tzdata

# PNPM Setup
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm
RUN pnpm config set store-dir /pnpm/store &&\
    pnpm config set package-import-method copy

# Working Directory
WORKDIR /usr/src/app
COPY package.json .
COPY pnpm-lock.yaml .

# Dev Image
FROM base AS dev

ENV NODE_ENV=development
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prefer-offline --ignore-scripts --frozen-lockfile

# Install Dependencies (prod-only)
FROM base AS prod-deps

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --prefer-offline --ignore-scripts --frozen-lockfile

# Build
FROM base AS build

COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prefer-offline --ignore-scripts --frozen-lockfile
RUN pnpm run build

# Production Image
FROM base AS prod

ENV NODE_ENV=production
COPY .production.env .
COPY --from=prod-deps /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/dist /usr/src/app/dist

ENTRYPOINT [ "pnpm", "start:prod" ]