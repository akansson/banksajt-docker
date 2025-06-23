FROM node:alpine
WORKDIR /app

# Flytta package.json till ./ -> /app/package.json
COPY package*.json ./

# /app/package.json
# /app/node_modules
RUN npm install

# /app/(hela projektet)
COPY . . 

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]