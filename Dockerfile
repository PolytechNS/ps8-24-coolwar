FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install uuid
RUN npm install
COPY back .
COPY front ./front
EXPOSE 3000
CMD ["node", "index.js"]
