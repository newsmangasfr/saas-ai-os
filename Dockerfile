FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev=false
COPY . .
RUN npm run build
ENV PORT=3000 NODE_ENV=production DB_PATH=/app/data/saas.db
RUN mkdir -p /app/data
EXPOSE 3000
# rebuild-bust 2026-10-07 v2
CMD ["npx", "next", "start"]
