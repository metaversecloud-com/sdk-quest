FROM --platform=linux/arm64 node:18.14.2-alpine3.17
WORKDIR /app

ADD server ./server
ADD client ./client
COPY package.json .

ENV NODE_ENV=production
ENV DEFAULT_EGG_IMAGE_URL=https://topiaimages.s3.us-west-1.amazonaws.com/arva_egg.png
ENV API_URL=http://localhost:3001

EXPOSE 3000
RUN npm install
RUN npm run build

CMD ["npm", "start"]
