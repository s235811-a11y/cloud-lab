FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY server ./server
COPY models ./models

EXPOSE 5000

CMD ["npm", "start"]