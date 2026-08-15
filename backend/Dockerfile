FROM node:18-alpine

WORKDIR /app

# Install build tools for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY src ./src

# Create uploads directory structure
RUN mkdir -p uploads/audio uploads/covers

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 4000

CMD ["node", "src/index.js"]
