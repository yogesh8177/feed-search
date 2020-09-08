FROM node:14

WORKDIR /feed-app
COPY . .

WORKDIR /feed-app/ui
RUN npm install
RUN npm install -g @angular/cli
RUN ./node_modules/protractor/bin/webdriver-manager update
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -y
RUN apt install ./google-chrome-stable_current_amd64.deb


EXPOSE 4200
CMD [ "ng", "serve" ]