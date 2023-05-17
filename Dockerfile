FROM node:18-alpine3.17
WORKDIR /app
COPY server .
COPY client .
COPY package.json .
EXPOSE 3000
RUN npm install
RUN npm run build
CMD ["npm", "start"]
