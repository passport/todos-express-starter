# Use an official Node.js runtime as a base image
FROM node:20.5.0

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Expose a port that your app will listen on
EXPOSE 3000

# Define the command to run your app
CMD ["node", "app.js"]