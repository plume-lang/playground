FROM oven/bun:latest

COPY --from=docker:dind /usr/local/bin/docker /usr/local/bin/

WORKDIR /playground

COPY . /playground/api

# install the dependencies
RUN cd /playground/api && bun install

EXPOSE ${SERVER_PORT}

# run the API
ENTRYPOINT [ "bun", "run", "/playground/api/index.ts"]