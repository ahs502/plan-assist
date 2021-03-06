FROM centos:7.2.1511

ENV NODE_VERSION 13
RUN curl -sL https://rpm.nodesource.com/setup_$NODE_VERSION.x | bash - && yum install nodejs -y

RUN mkdir /Release
COPY . /Release
WORKDIR /Release

EXPOSE 3000

CMD npm start
