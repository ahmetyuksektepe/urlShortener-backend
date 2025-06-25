# Base image
FROM node:18-alpine

# App dizinine geç
WORKDIR /app

# Paketleri kopyala ve yükle
COPY package*.json ./
RUN npm install

# Kodları kopyala
COPY . .

# Uygulama 3000 portunda çalışacak
EXPOSE 3000

# Uygulama başlat
CMD ["node", "server.js"]
