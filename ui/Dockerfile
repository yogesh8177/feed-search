FROM node:14

WORKDIR /feed-ui
COPY . .

# Install node modules
RUN cd ui && npm install && npm install -g @angular/cli


WORKDIR /feed-ui/ui

# Update protractor webdriver
RUN ./node_modules/protractor/bin/webdriver-manager update

# To solve add-apt-repository : command not found
RUN apt-get update

# Install Java
RUN apt-get install default-jdk -y

ENV DOCKERIZE_VERSION v0.6.0

RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
   && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
   && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz
  

# RUN npm run lint
RUN npm run build
EXPOSE 4200/tcp