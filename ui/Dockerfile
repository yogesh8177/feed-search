FROM node:14

WORKDIR /feed-app
COPY . .

WORKDIR /feed-app/ui
RUN npm install
RUN npm install -g @angular/cli

EXPOSE 4200
CMD [ "ng", "serve" ]