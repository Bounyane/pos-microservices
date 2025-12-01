FROM node:18-alpine

WORKDIR /app

COPY services/catalogue-service/ /app

RUN npm install

COPY . .

EXPOSE 8083

CMD ["npm", "run", "dev"]
