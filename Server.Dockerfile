FROM node:lts

WORKDIR /app

# Kopieer alleen package.json en package-lock.json eerst (voor caching)
COPY ./Server/package*.json ./

# Installeer dependencies
RUN npm install

# Kopieer de rest van de backend code
COPY ./Server ./ 

# Genereer Prisma client
RUN npx prisma generate

# Start server
CMD ["node", "server.js"]
