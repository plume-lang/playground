FROM oven/bun:alpine

WORKDIR /playground/frontend

COPY . /playground/frontend

# install the dependencies

RUN cd /playground/frontend && bun install

# run the frontend

EXPOSE 3002

ENTRYPOINT [ "bun", "run", "dev"]