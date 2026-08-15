FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install --omit=dev

COPY src ./src

RUN mkdir -p /app/data
RUN mkdir -p /app/uploads/audio
RUN mkdir -p /app/uploads/covers

EXPOSE 4000

CMD ["node", "src/index.js"]