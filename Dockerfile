FROM node:14

WORKDIR /feed-web
COPY package*.json ./
RUN npm install
COPY . .

ENV BUILD_TEXT_FILE ./build.txt

RUN rm ${BUILD_TEXT_FILE} && touch ${BUILD_TEXT_FILE} && echo ${GITHUB_RUN_ID} > ${BUILD_TEXT_FILE} 

EXPOSE 8000
CMD [ "node", "server.js" ]