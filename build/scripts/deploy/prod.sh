#!/usr/bin/env sh
NITRO_PRESET=node-server npm run build
node .output/server/index.mjs
