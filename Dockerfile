FROM node:14

COPY package.json /app/package.json

RUN cd app && npm install

COPY api.js /app/api.js

CMD ["node", "/app/api.js"] 

