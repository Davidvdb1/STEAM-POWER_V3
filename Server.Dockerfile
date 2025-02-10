FROM node:lts

WORKDIR /app
COPY ./ ./

WORKDIR /app/Server
RUN npm i
ENTRYPOINT [ "node", "server.js" ]