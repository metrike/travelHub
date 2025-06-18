FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install -g nodemon

COPY . .

ENV DEBUG=express:*

EXPOSE 8000

CMD ["nodemon", "--trace-warnings", "index.js"]
