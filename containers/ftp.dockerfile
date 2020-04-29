FROM nikolaik/python-nodejs
LABEL maintainer="Bruce Mcpherson <bruce@mcpher.com>"
# build docker image for ftp dev mode
WORKDIR /usr/src/td/ftp
COPY package.json .
COPY ./common ./common
COPY ./ftp ./ftp
RUN yarn  --production=true
RUN cd ftp && yarn  --production=true
# these are the connectable ports
# connection port - override the settings with these env variables
## all the env variables will be set by the contents of the deployment yaml file
## but i think we still need this here - so just expose the entire range
EXPOSE 17001-17999
EXPOSE 20-21
CMD [ "node", "ftp/index.js" ]