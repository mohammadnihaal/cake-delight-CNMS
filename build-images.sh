#!/usr/bin/env sh
# Builds one Docker image per component. Run from the cake-delight folder.
set -e
for svc in catalog-service order-service rating-service notification-service gateway frontend; do
  echo "Building cakedelight/$svc ..."
  docker build -t "cakedelight/$svc:latest" "./$svc"
done
echo "All images built."
