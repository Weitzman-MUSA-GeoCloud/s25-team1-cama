# Dockerfile

# 1. Use Node.js as the base image
FROM node:20-slim

# 2. Create app directory
WORKDIR /usr/src/app

# 3. Install app dependencies
COPY package.json ./
RUN npm install

# 4. Copy app source
COPY index.js ./

# 5. Expose port 8080
EXPOSE 8080

# 6. Start the server
CMD [ "npm", "start" ]