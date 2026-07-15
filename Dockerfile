# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency configs
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source files
COPY index.html tailwind.config.js postcss.config.js vite.config.js ./
COPY src/ ./src/
COPY public/ ./public/

# Build production bundle
RUN npm run build

# Stage 2: Serve the build directory via Nginx
FROM nginx:alpine

# Remove default Nginx welcome site configurations safely
RUN rm -rf /usr/share/nginx/html/*

# Copy production build files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Spin up Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
