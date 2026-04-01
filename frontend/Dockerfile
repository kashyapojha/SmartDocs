# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Accept build argument for API URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy build output
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Start app
CMD ["serve", "-s", "build", "-l", "3000"]