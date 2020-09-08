FROM node:14

WORKDIR /feed-ui
COPY . .

RUN npm install
RUN npm install -g @angular/cli
RUN ./node_modules/protractor/bin/webdriver-manager update
RUN apt-get update
RUN apt-get --only-upgrade install google-chrome-stable -y
RUN google-chrome --version


EXPOSE 4200
CMD [ "ng", "serve" ]