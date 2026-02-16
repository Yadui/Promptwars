# Stage 1: Build the React app
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Build argument for the API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
# Copy the build output to replace the default nginx contents.
COPY --from=build /app/dist /usr/share/nginx/html
# Custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
# Use a custom entrypoint to make nginx listen on the PORT provided by Cloud Run
CMD ["sh", "-c", "sed -i \"s/listen[[:space:]]*80;/listen ${PORT:-8080};/g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
