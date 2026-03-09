FROM node:18-bullseye

# Copy project files
WORKDIR /app
COPY . .

# Setup Node Frontend and Build it
RUN npm install
RUN npm run build

# Expose the correct port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
