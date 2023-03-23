#!/usr/bin/env sh
if [[ ${DEPLOY_ENV} = 'prod' ]]; then
  NITRO_PRESET=node-server npm run build
fi