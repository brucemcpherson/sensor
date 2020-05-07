FROM nikolaik/python-nodejs
LABEL maintainer="Bruce Mcpherson <bruce@mcpher.com>"
# build docker image for ftp dev mode
WORKDIR /usr/src/td/ftp
COPY package.json .
COPY ./common ./common
COPY ./ftp ./ftp
RUN yarn  --production=true
RUN cd ftp && yarn  --production=true
CMD [ "node", "ftp/index.js" ]