FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Ajoutez cette variable pour plus de logs
ENV DEBUG=express:*

EXPOSE 8000

CMD ["node", "--trace-warnings", "index.js"]