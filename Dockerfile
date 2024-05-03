FROM docker:26.1.1-alpine3.19

WORKDIR /www

# Copy whole project

COPY . /www

# Fetch the Plume compiler
RUN \
  wget https://github.com/plume-lang/plume/releases/download/0.6.5/plume-ubuntu-latest.zip && \
  unzip plume-ubuntu-latest.zip -d /www/server/compiler/

# Set the path to the Plume compiler

ENV PLUME_PATH /www/server/compiler/standard/

# Build the compiler and interpreter Docker files

RUN \
  cd /www/server && \
  docker build server -t plume-compiler -f Dockerfile.compiler && \
  docker build interpreter -t plume-interpreter -f Dockerfile.interpreter

FROM node:20-alpine

ARG PORT=3000

WORKDIR /www
COPY --from=0 /www /www

# Create environment file

RUN echo "PORT=$PORT\nSERVER_PATH=/www/server" > .env

# Install dependencies and expose the server

RUN npm install -f
RUN npm run build

EXPOSE $PORT

# Start the server

CMD ["npm", "run"]