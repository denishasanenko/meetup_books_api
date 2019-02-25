FROM node:10

WORKDIR /usr/src
COPY src ./
RUN npm install

EXPOSE 3000

CMD ["node", "index.js"]