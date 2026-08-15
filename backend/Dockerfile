FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install --omit=dev

COPY src ./src

RUN mkdir -p uploads/audio uploads/covers

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', r => { if (r.statusCode !== 200) process.exit(1) })"

CMD ["node", "src/index.js"]