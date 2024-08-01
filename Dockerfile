# Dev Image
FROM node:18.20.4-alpine3.20 AS dev

# Working Directory
WORKDIR /usr/src/app

# Timezone - Seoul (UTC+09)
ENV TZ=Asia/Seoul
RUN apk add tzdata &&\
    ln -s /usr/share/zoneinfo/Asia/Seoul /etc/localtime

# Copy Source
COPY . .

# Set Yarn Berry & Install Packages
RUN corepack enable &&\
    yarn set version berry
RUN yarn