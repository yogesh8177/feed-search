FROM node:14

WORKDIR /feed-ui
COPY . .

RUN npm install
RUN npm install -g @angular/cli
RUN ./node_modules/protractor/bin/webdriver-manager update
RUN apt-get update
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable_current_amd64.deb; apt-get -fy install
RUN google-chrome --version


EXPOSE 4200
CMD [ "ng", "serve" ]