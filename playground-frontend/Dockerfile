FROM oven/bun:latest

WORKDIR /playground/playground-frontend

COPY . /playground/playground-frontend

# install the dependencies

ENV SERVER_PORT=3002

RUN cd /playground/playground-frontend && bun install
RUN bun run build

# run the frontend

EXPOSE ${SERVER_PORT}

ENTRYPOINT [ "bun", "run", "serve.ts" ]