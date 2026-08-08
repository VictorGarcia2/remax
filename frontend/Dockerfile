FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=256"
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
