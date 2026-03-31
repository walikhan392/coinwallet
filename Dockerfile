FROM node:18-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y tor

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 10000

CMD tor & sleep 10 && node server/index.js
