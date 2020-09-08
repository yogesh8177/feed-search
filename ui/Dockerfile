FROM node:14

WORKDIR /feed-app
COPY . .

WORKDIR /feed-app/ui
RUN npm install
RUN npm install -g @angular/cli
RUN ./node_modules/protractor/bin/webdriver-manager update
RUN sudo apt-get update
RUN sudo apt-get --only-upgrade install google-chrome-stable
RUN google-chrome --version


EXPOSE 4200
CMD [ "ng", "serve" ]