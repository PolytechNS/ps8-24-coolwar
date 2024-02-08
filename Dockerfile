FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY back .
EXPOSE 3000
CMD ["node", "index.js"]
