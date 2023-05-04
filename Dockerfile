# Use the official Python image as the base image
FROM python:3.9

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

# Create the working directory
WORKDIR /app

# Copy the requirements file for the backend
COPY backend/requirements.txt .

# Install the backend requirements
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . .

# Install frontend dependencies
RUN cd frontend && npm ci

# Expose the backend port
EXPOSE 5000

# Start the application using concurrently
CMD ["npm", "run", "start"]
