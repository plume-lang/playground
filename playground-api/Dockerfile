FROM oven/bun:latest

COPY --from=docker:dind /usr/local/bin/docker /usr/local/bin/

WORKDIR /playground/playground-api

COPY . /playground/playground-api

# install the dependencies
RUN cd /playground/playground-api && bun install

EXPOSE ${SERVER_PORT}

# run the API
ENTRYPOINT [ "bun", "run", "/playground/playground-api/index.ts"]