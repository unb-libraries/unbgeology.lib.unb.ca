#!/usr/bin/env sh
if [[ ${DEPLOY_ENV} != 'local' ]]; then
  NITRO_PRESET=node-server npm run build
fi