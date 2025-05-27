FROM node:18-alpine
WORKDIR /app

#Copia archivos necesarios
COPY package*.json ./
RUN npm install

#Copia todo el backend
COPY . .

#Puerto donde corre express
EXPOSE 3000

CMD ["node", "app.js"]