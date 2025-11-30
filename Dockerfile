# Use Node with Debian so we can install python
FROM node:18

# Install python, pip, venv, and required system libs for OpenCV
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv \
    libgl1 \
    libglib2.0-0

# Set working directory
WORKDIR /app

# Copy package.json and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy the entire project
COPY . .

# Create Python virtual environment
RUN python3 -m venv /app/venv

# Upgrade pip inside venv
RUN /app/venv/bin/pip install --upgrade pip

# Install Python dependencies
RUN /app/venv/bin/pip install --no-cache-dir -r requirements.txt

# Tell Node which python to use
ENV PYTHON=/app/venv/bin/python

# Expose Railway's port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
