FROM node:lts

COPY package.json /front-end/package.json

RUN cd front-end && npm install

COPY front-end.js /front-end/front-end.js

COPY app /front-end/app

COPY routes /front-end/routes

COPY website /front-end/website

CMD ["node", "/front-end/front-end.js"] 

