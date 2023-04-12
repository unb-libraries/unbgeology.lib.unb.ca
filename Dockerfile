FROM ghcr.io/unb-libraries/node:18.x

ENV APP_STARTUP_CMD "node .output/server/index.mjs"
ENV NUXT_SITE_ID unbgeology
ENV NUXT_SITE_URI unbgeology.lib.unb.ca
ENV NUXT_SITE_UUID a6686492-dc6a-436b-8d6f-5f8a92f28e9a

ENV NUXT_PORT 80
ENV NITRO_PORT 80
ENV LIGHTSHIP_PORT 9118

# Build application.
COPY ./build /build
COPY ./app .

RUN ${RSYNC_MOVE} /build/scripts/ /scripts/ && \
    ${RSYNC_MOVE} /build/package*.json .

# Container metadata.
LABEL ca.unb.lib.generator="nuxt3" \
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
