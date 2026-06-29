# Backend container — works on Koyeb, Render, Fly, Railway, etc.
FROM node:20-bookworm-slim

WORKDIR /app

# Prisma needs OpenSSL on slim images
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies (cached unless package files change)
COPY package*.json ./
RUN npm install

# Build the app
COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

# Apply DB migrations, then start the API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
