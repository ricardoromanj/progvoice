FROM ruby:2.4.3-alpine3.4
MAINTAINER Ricardo Roman <ricardo.roman@ticnsp.org>
RUN mkdir /app /app/tmp && apk update && apk add curl-dev ruby-dev build-base \
    zlib-dev libxml2-dev libxslt-dev tzdata yaml-dev \
    ruby ruby-io-console ruby-json yaml nodejs postgresql-dev
WORKDIR /app
COPY ./Gemfile /app/Gemfile
COPY ./Gemfile.lock /app/Gemfile.lock
RUN bundle install
COPY . /app
CMD ["ruby", "app.rb"]
