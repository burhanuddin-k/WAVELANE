# Stage 1: Build & install dependencies
FROM node:18-alpine AS builder
WORKDIR /app

# Install build dependencies for native Node addons
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# Stage 2: Minimal production image
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy pre-built node_modules and source from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package*.json ./

# Create required directories with appropriate ownership
RUN mkdir -p uploads/audio uploads/covers

EXPOSE 5000
CMD ["node", "src/index.js"]