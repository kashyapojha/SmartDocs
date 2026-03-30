# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Accept build argument for API URL
ARG REACT_APP_API_URL=http://localhost:5000
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_ENV=production
ENV REACT_APP_DEBUG=false

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Production stage - Serve built app
FROM node:18-alpine
WORKDIR /app

# Install serve to run the app
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]
