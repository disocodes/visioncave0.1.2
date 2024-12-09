FROM node:16

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./

# Clean install dependencies and additional packages
RUN npm install && \
    npm install -g react-scripts@5.0.1 && \
    npm install chart.js@4.4.1 react-chartjs-2@5.2.0 reactflow@11.10.1 @mui/icons-material@5.11.16

# Copy source code
COPY . .

# Set development environment
ENV NODE_ENV=development
ENV PATH /app/node_modules/.bin:$PATH

# Expose port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
