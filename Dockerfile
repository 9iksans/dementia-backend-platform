FROM node:14

COPY package.json /app/package.json

RUN cd app && npm install

COPY mqtt-buffer.js /app/mqtt-buffer.js

CMD ["node", "/app/mqtt-buffer.js"] 

