FROM node:14

WORKDIR /feed-ui
COPY . .

# Install node modules
RUN npm install

# Install angular cli
RUN npm install -g @angular/cli

# Update protractor webdriver
RUN ./node_modules/protractor/bin/webdriver-manager update

# Install chrome for e2e tests
RUN apt-get update
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable_current_amd64.deb; apt-get -fy install
RUN google-chrome --version

# To solve add-apt-repository : command not found
RUN apt-get update

# Install Java
RUN apt-get install default-jdk -y
  

EXPOSE 4200
CMD [ "ng", "serve" ]