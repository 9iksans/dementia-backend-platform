FROM node:lts

COPY package.json /rest/package.json

RUN cd rest && npm install

COPY rest.js /rest/rest.js

COPY app /rest/app

COPY routes /rest/routes

COPY profileimage /rest/profileimage


CMD ["node", "/rest/rest.js"] 

