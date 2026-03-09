FROM node:18-bullseye

# Install Python 3 and pip
RUN apt-get update || : && apt-get install python3 python3-pip -y

# Copy project files
WORKDIR /app
COPY . .

# Setup Python Backend
WORKDIR /app/python-parser
RUN pip3 install -r requirements.txt

# Setup Node Frontend and Build it
WORKDIR /app/web-app
RUN npm install
RUN npm run build

# Expose the correct port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
