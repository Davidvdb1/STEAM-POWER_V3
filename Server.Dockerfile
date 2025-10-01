FROM node:18

WORKDIR /app

# Kopieer package files
COPY package*.json ./
COPY prisma ./prisma/

# Installeer dependencies
RUN npm install

# Genereer Prisma Client tijdens build
RUN npx prisma generate

# Kopieer rest van de applicatie
COPY . .

EXPOSE 3000

CMD ["npm", "start"]