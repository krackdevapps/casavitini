FROM node:lts
WORKDIR /usr/src/app
COPY . .
RUN npm install
CMD "node casaVitini.mjs"
