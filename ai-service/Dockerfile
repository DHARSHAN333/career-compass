FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app
COPY . /app

EXPOSE 8000

CMD ["sh", "-c", "node server.js"]
