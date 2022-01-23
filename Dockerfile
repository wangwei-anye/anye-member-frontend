FROM hk01/docker-node:10-v0.1 AS builder

ARG BUILD_ENV
# - build arg to assign token for yarn internal packages
ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

WORKDIR /srv

COPY . .

RUN /base/scripts/token-init.sh \
    && yarn \
    && npm run build:${BUILD_ENV}

## finally build stage
FROM hk01/docker-nginx:v0.4 AS finally

WORKDIR /srv

COPY --from=builder /srv/dist/. .
