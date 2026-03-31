# 1. Imagen base de Node.js (liviana)
FROM node:20-slim

# 2. Instalamos OpenSSL (necesario para que Prisma conecte a la DB)
RUN apt-get update -y && apt-get install -y openssl

# 3. Directorio de trabajo dentro del contenedor
WORKDIR /app

# 4. Copiamos archivos de dependencias y la carpeta prisma
COPY package*.json ./
COPY prisma ./prisma/

# 5. Instalamos las dependencias
RUN npm install

# 6. Copiamos el resto del código del proyecto
COPY . .

# 7. Generamos el cliente de Prisma para que el contenedor lo reconozca
RUN npx prisma generate

# 8. Exponemos el puerto 4000 (el que usa tu API)
EXPOSE 4000

# 9. Comando para iniciar la app en modo desarrollo
CMD ["npm", "run", "dev"]