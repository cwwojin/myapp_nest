FROM node:18.20.4-alpine3.20 AS base

# Working Directory
WORKDIR /usr/src/app

# Timezone - Seoul (UTC+09)
ENV TZ=Asia/Seoul
RUN apk update &&\
    apk add tzdata &&\
    ln -s /usr/share/zoneinfo/Asia/Seoul /etc/localtime

# Dev Image
FROM base AS dev

# Install Dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn

# Copy Source
COPY . .
