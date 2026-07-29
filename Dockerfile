FROM node:26-alpine3.23 AS base

ENV APP_ROOT=/app

ENV NODE_ENV=production

ENV NUXT_SITE_ID=unbgeology
ENV NUXT_SITE_URI=unbgeology.lib.unb.ca
ENV NUXT_SITE_UUID=a6686492-dc6a-436b-8d6f-5f8a92f28e9a
ENV NUXT_PORT=80
ENV NITRO_PORT=80
ENV LIGHTSHIP_PORT=9118

WORKDIR $APP_ROOT
RUN apk update && \
    apk add bash


# Local development image
FROM base AS development

ENV NODE_ENV=development

COPY ./app .

RUN apk update && \
    apk add curl && \
    npm install

CMD ["npm", "run", "dev"]


# Throw-away build image
FROM base AS build

COPY ./app .

RUN npm ci --include=dev && \
    npm cache clean --force && \
    NITRO_PRESET=node-server npm run build


# Deployment image
FROM base

COPY --from=build $APP_ROOT/.output .

CMD ["node", "./server/index.mjs"]

# ENV APP_STARTUP_CMD="node ./server/index.mjs"

LABEL org.opencontainers.image.title="unbgeology.lib.unb.ca" \
  org.opencontainers.image.description="unbgeology.lib.unb.ca provides access to the UNB Earth Science Collection of geological specimen." \
  org.opencontainers.image.vendor="University of New Brunswick Libraries" \
  org.opencontainers.image.url="https://unbgeology.lib.unb.ca" \
  org.opencontainers.image.source="https://github.com/unb-libraries/unbgeology.lib.unb.ca" \
  org.opencontainers.image.vendor="University of New Brunswick Libraries" \
  org.opencontainers.image.version="$VERSION"
