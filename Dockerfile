# Build stage
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Create a directory for the database to ensure persistence
RUN mkdir -p /usr/src/app/data
ENV DATABASE_PATH=/usr/src/app/data/database.sqlite

# Expose the port the app runs on
EXPOSE 3000

# Run the app
CMD [ "npm", "start" ]
