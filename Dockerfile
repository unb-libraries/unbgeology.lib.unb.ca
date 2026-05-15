FROM ghcr.io/unb-libraries/node:24.x AS base

ENV APP_ROOT=/app

ENV NODE_ENV=production

ENV NUXT_SITE_ID=unbgeology
ENV NUXT_SITE_URI=unbgeology.lib.unb.ca
ENV NUXT_SITE_UUID=a6686492-dc6a-436b-8d6f-5f8a92f28e9a
ENV NUXT_PORT=80

ENV NITRO_PORT=80
ENV LIGHTSHIP_PORT=9118

WORKDIR $APP_ROOT

COPY ./build /build

RUN ${RSYNC_MOVE} /build/scripts/ /scripts/


# Local development image
FROM base AS development

ENV NODE_ENV=development

COPY ./app .

RUN npm install

ENV APP_STARTUP_CMD="npm run dev --no-clear"


# Throw-away build image
FROM base AS build

COPY ./app .

RUN npm ci --include=dev && \
  npm cache clean --force && \
  NITRO_PRESET=node-server npm run build && \
  # TODO: Remove this once permission management has been refactored to not require casbin
  cp ./model.conf ./policy.csv ./.output/


# Deployment image
FROM base

COPY --from=build $APP_ROOT/.output .

ENV APP_STARTUP_CMD="node ./server/index.mjs"

LABEL ca.unb.lib.generator="nuxt4" \
  com.microscaling.docker.dockerfile="/Dockerfile" \
  com.microscaling.license="MIT" \
  org.label-schema.build-date=$BUILD_DATE \
  org.label-schema.description="unbgeology.lib.unb.ca provides access to the UNB Earth Science Collection of geological specimen." \
  org.label-schema.name="unbgeology.lib.unb.ca" \
  org.label-schema.schema-version="1.0" \
  org.label-schema.url="https://unbgeology.lib.unb.ca" \
  org.label-schema.vcs-ref=$VCS_REF \
  org.label-schema.vcs-url="https://github.com/unb-libraries/unbgeology.lib.unb.ca" \
  org.label-schema.vendor="University of New Brunswick Libraries" \
  org.label-schema.version=$VERSION \
  org.opencontainers.image.source="https://github.com/unb-libraries/unbgeology.lib.unb.ca"
