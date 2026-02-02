FROM node:18-alpine

WORKDIR /app

COPY services/ai-service/package*.json ./

RUN npm install --production

COPY services/ai-service/ .
COPY shared/libraries/cashback.proto ./cashback.proto

EXPOSE 50052

CMD ["node", "server.js"]
