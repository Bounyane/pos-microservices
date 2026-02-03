FROM node:18-alpine

WORKDIR /app

COPY services/wallet-service/package*.json ./

RUN npm install --production

COPY services/wallet-service/ .

EXPOSE 8087

CMD ["node", "server.js"]
