# Use official Node.js image as the base
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package manager files first for better cache
COPY pnpm-lock.yaml package.json ./
COPY pnpm-workspace.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Expose ports (Vite default: 5173, custom for serve: 3000)
EXPOSE 5173 3000

# Default command (can be overridden)
CMD ["pnpm", "dev"]
