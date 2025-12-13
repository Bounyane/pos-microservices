FROM node:18-alpine

WORKDIR /app

COPY services/analytic-service/ /app

RUN npm install

COPY . .

EXPOSE 8085

CMD ["npm", "run", "dev"]