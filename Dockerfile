# Defines the environment for the Next.js application.
# This file assumes the Next.js project is in the root directory.
FROM node:20-alpine

# Set the working directory inside the container.
WORKDIR /app

# Copy package manager files. This leverages Docker's layer caching,
# so dependencies are only re-installed when these files change.
COPY package.json package-lock.json* ./

# Install project dependencies.
RUN npm install

# Copy the rest of the application source code into the container.
COPY . .

# Expose the port Next.js runs on for development.
EXPOSE 3000

# The command to start the Next.js development server with hot-reloading.
CMD ["npm", "run", "dev"]
