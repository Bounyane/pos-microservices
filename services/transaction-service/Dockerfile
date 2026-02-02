FROM node:18-alpine

WORKDIR /app

COPY services/transaction-service/package*.json ./

RUN npm install --production

COPY services/transaction-service/ .
COPY shared/libraries/cashback.proto ./cashback.proto

EXPOSE 8086

CMD ["node", "server.js"]
