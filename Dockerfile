FROM node:lts

COPY package.json /app/package.json

RUN cd app && npm install

COPY dbconnect.js /app/dbconnect.js

COPY mqtt-buffer.js /app/mqtt-buffer.js

CMD ["node", "/app/mqtt-buffer.js"] 

