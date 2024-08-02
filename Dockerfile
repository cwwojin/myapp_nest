FROM node:18.20.4-alpine3.20 AS base

# Local Timezone - Seoul (UTC+09)
ENV TZ=Asia/Seoul
RUN apk add tzdata &&\
    ln -s /usr/share/zoneinfo/Asia/Seoul /etc/localtime

# PNPM Setup
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

# Working Directory
WORKDIR /usr/src/app

# Copy Source
COPY . .

# Dev Image
FROM base AS dev
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Install Dependencies (prod-only)
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# Production Image
FROM base AS prod
COPY --from=prod-deps /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/dist /usr/src/app/dist