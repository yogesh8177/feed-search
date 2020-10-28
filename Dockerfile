FROM node:12

COPY ./voting-service ./app

WORKDIR /app

ARG ENV

ENV NODE_ENV ${ENV}

RUN npm install

EXPOSE 3000

CMD ["node", "index.js"]