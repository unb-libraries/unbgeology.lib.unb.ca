#!/usr/bin/env sh
if [[ -f ./package-lock.json ]]; then
  npm ci && npm cache clean --force
else
  npm install
fi