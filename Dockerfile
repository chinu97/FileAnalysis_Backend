# Use official Node.js image as the base image
FROM node:14.19.1

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port specified in the environment variable or default to 3000
ENV PORT=3000
EXPOSE $PORT

# Set environment variables
ENV S3_BUCKET_NAME=avaamo-file-uploads
ENV S3_PRESIGNED_URL_EXPIRATION_TIME=36000
ENV S3_REGION=ap-south-1
ENV THESAURUS_API_KEY=LVBQOTD2YcVxHSmQRZT37w==BL2RjxdHmn8ox5Hn
ENV MONGODB_URI=mongodb://localhost:27017/files

# Command to run the Node.js application
CMD ["node", "server.js"]

