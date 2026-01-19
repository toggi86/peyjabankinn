# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Set CI environment to avoid npm prompts in CI
ENV CI=true
ENV NPM_CONFIG_PROGRESS=false
ENV NPM_CONFIG_LOGLEVEL=error

# Copy package files first for caching
COPY package.json package-lock.json* ./
RUN npm install --no-optional --silent

# Copy source code
COPY . .

# Build production assets
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
