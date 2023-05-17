FROM node:18-alpine3.17
WORKDIR /app

COPY server ./server
COPY client ./client
COPY package.json .

ENV INTERACTIVE_KEY=
ENV INTERACTIVE_SECRET=
ENV NODE_ENV=production
ENV DEFAULT_EGG_IMAGE_URL=https://topiaimages.s3.us-west-1.amazonaws.com/arva_egg.png
ENV API_URL=http://localhost:3001

EXPOSE 3000
RUN npm run build

CMD ["npm", "run", "start"]
