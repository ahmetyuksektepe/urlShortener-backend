
FROM node:18-alpine

# Çalışma dizini oluştur
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Uygulama kodlarını kopyala
COPY . .

# Non-root user oluştur (güvenlik için)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Dosya sahipliğini değiştir
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Port expose et
EXPOSE 3000

# Health check ekle
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/test || exit 1

# Uygulamayı başlat
CMD ["node", "server.js"] 