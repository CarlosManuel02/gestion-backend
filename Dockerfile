# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and yarn.lock files to the working directory
COPY package.json yarn.lock ./

COPY .env ./

# Install the application dependencies and NestJS CLI globally
RUN yarn install --production && yarn global add @nestjs/cli

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 8080 for the application
EXPOSE 8080

# Ejecuta el comando de inicio de la aplicación
CMD ["npm", "run", "start:dev"]