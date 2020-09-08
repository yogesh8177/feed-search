FROM node:14

WORKDIR /feed-app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8000
CMD [ "node", "server.js" ]