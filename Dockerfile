# Use a more complete Node.js image with required dependencies
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Install PhantomJS dependencies and utilities
RUN apt-get update && apt-get install -y \
    libfreetype6 \
    libfontconfig1 \
    wget \
    bzip2 \
    curl \
    git \
    ca-certificates \
    fontconfig \
    libpng-dev \
    libjpeg-dev \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install PhantomJS both ways to ensure it's available
# 1. System-wide installation
RUN wget -q -O - https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 | tar xj -C /tmp && \
    mv /tmp/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin && \
    chmod +x /usr/local/bin/phantomjs && \
    rm -rf /tmp/phantomjs-2.1.1-linux-x86_64

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies with explicit phantomjs
RUN npm install --production
RUN npm install phantomjs-prebuilt html-pdf --save

# Create directory for PDF files and set permissions
RUN mkdir -p /app/src/pdfgenerator

# Copy the rest of the application code to the working directory
COPY . .

# Ensure proper permissions
RUN chmod -R 755 /app/src/pdfgenerator

# Expose the port the app runs on
EXPOSE 3000

# Make scripts executable
RUN chmod u+x setup-dirs.sh pdf-diagnostic.sh

# Define the command to run your app
CMD ["/bin/bash", "-c", "./setup-dirs.sh && npm start"]