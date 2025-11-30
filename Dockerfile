# Use Node with Debian so we can install python
FROM node:18

# Install Python + pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy package.json first
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy everything else
COPY . .

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Expose Railway port
ENV PORT=8080
EXPOSE 8080

# Start the Node server
CMD ["node", "server.js"]
