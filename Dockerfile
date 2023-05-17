FROM node:18-alpine3.17
WORKDIR /app

COPY server ./server
COPY client ./client
COPY package.json .

ENV INTERACTIVE_KEY=OmOO7TRGRe5IAB1QVMX8
ENV INTERACTIVE_SECRET=MmVlOWQ0ODUtMmEyYS00ZTQ4LTgyNzAtYWY5MjlkMzA4NGI2
ENV NODE_ENV=development
ENV DEFAULT_EGG_IMAGE_URL=https://topiaimages.s3.us-west-1.amazonaws.com/arva_egg.png
ENV API_URL=http://localhost:3001

EXPOSE 3000
RUN npm run build

CMD ["npm", "run", "start"]
