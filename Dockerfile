FROM ruby:2.7.2

RUN apt-get update && apt-get install -y jekyll

# Setting the working directory
WORKDIR /workspace

COPY Gemfile /workspace/Gemfile

RUN bundle install

# Copying the required codebase
COPY . /workspace

RUN wget http://verovio-web-viewer.dev.enote.com/verovio-toolkit.js -O scripts/verovio-toolkit-enote.js

EXPOSE 4000

# Entry point
CMD ./.serve-local