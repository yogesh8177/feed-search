FROM node:14

WORKDIR /feed-ui
COPY . .

# Install node modules
RUN npm install

# Install angular cli
RUN npm install -g @angular/cli

# Update protractor webdriver
RUN ./node_modules/protractor/bin/webdriver-manager update

# # Install chrome for e2e tests
# RUN apt-get update
# RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
# RUN dpkg -i google-chrome-stable_current_amd64.deb; apt-get -fy install
# RUN google-chrome --version

# # To solve add-apt-repository : command not found
# RUN apt-get update

# # Install Java
# RUN apt-get install default-jdk -y

ENV DOCKERIZE_VERSION v0.6.0

RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
   && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
   && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz
  

# RUN npm run lint
RUN npm run build
EXPOSE 4200/tcp