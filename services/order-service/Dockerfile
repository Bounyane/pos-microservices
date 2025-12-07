FROM node:18-alpine

WORKDIR /app

COPY services/order-service/ /app

RUN npm install

COPY . .

EXPOSE 8084

CMD ["npm", "run", "dev"]
