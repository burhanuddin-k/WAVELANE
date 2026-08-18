FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p data uploads/audio uploads/covers
EXPOSE 4000
CMD ["npm","start"]