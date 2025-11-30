# Use Node with Debian so we can install python
FROM node:18

# Install python & required tools
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Create working directory
WORKDIR /app

# Copy package.json and install Node dependencies first
COPY package*.json ./
RUN npm install

# Copy whole project
COPY . .

# Create a virtual environment for Python packages
RUN python3 -m venv /app/venv

# Upgrade pip inside venv
RUN /app/venv/bin/pip install --upgrade pip

# Install Python packages inside venv
RUN /app/venv/bin/pip install --no-cache-dir -r requirements.txt

# Set environment variable so Node uses venv Python
ENV PYTHON=/app/venv/bin/python

# Expose Railway port
EXPOSE 8080

# Start Node app
CMD ["node", "server.js"]
