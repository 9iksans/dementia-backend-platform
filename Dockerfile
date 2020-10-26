FROM node:14

COPY package.json /rest/package.json

RUN cd rest && npm install

COPY rest.js /rest/rest.js

COPY app /rest/app

COPY routes /rest/routes

CMD ["node", "/rest/rest.js"] 

