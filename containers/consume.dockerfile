FROM nikolaik/python-nodejs
LABEL maintainer="Bruce Mcpherson <bruce@mcpher.com>"
# build docker image for ftp dev mode
WORKDIR /usr/src/td/consume
COPY package.json .
COPY ./common ./common
COPY ./consume ./consume
RUN yarn  --production=true
RUN cd consume && yarn  --production=true
#how to run it
CMD [ "node", "consume/index.js" ]