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
RUN apt-get -y install software-properties-common

# Install Java
RUN \
  echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
  add-apt-repository -y ppa:webupd8team/java && \
  apt-get update && \
  apt-get install -y oracle-java8-installer --allow-unauthenticated && \
  rm -rf /var/lib/apt/lists/* && \
  rm -rf /var/cache/oracle-jdk8-installer

# JAVA_HOME variable
ENV JAVA_HOME /usr/lib/jvm/java-8-oracle

EXPOSE 4200
CMD [ "ng", "serve" ]