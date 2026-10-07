FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev=false
COPY . .
RUN npm run build
ENV PORT=3000 NODE_ENV=production
EXPOSE 3000
CMD ["npx", "next", "start"]
