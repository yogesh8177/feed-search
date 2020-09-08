FROM node:14

WORKDIR /feed-ui
COPY . .

WORKDIR /feed-ui
RUN npm install
RUN npm install -g @angular/cli
RUN ./node_modules/protractor/bin/webdriver-manager update
RUN sudo apt-get update
RUN sudo apt-get --only-upgrade install google-chrome-stable
RUN google-chrome --version


EXPOSE 4200
CMD [ "ng", "serve" ]