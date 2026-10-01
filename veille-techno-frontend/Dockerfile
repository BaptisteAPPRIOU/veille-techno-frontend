# Front end of the Kanban Board: built with Node, served by nginx.
# Build and run: `docker compose up -d --build`, then http://localhost:8080.

# Stage 1: build the static files. Node only lives in this stage, not in the final image.
FROM node:24-alpine AS build
WORKDIR /app

# Dependencies first: this layer stays cached as long as the lockfile does not change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: nginx serves the static files and forwards /api to the back end.
FROM nginx:stable-alpine

# The official image fills the templates with the environment variables at startup.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# Back end reached from the container: host.docker.internal is the machine running Docker.
ENV API_URL=http://host.docker.internal:3000

EXPOSE 80
