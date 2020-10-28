FROM node:12

COPY ./voting-service ./app

WORKDIR /app

ARG ENV
ARG BUILD_VERSION

ENV BUILD_TEXT_FILE ./build.txt
ENV NODE_ENV ${ENV}

RUN rm ${BUILD_TEXT_FILE} && touch ${BUILD_TEXT_FILE} && echo ${BUILD_VERSION} > ${BUILD_TEXT_FILE} 

ENV NODE_ENV production

RUN npm install

EXPOSE 3000

CMD ["node", "index.js"]