FROM oven/bun:latest

WORKDIR /playground/frontend

COPY . /playground/frontend

# install the dependencies

RUN cd /playground/frontend && bun install
RUN bun run build

# run the frontend

EXPOSE 3002

ENTRYPOINT [ "bun", "run", "serve.ts" ]