
FROM node:14-alpine3.15
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY .sgraphrc .sgraphrc
COPY northwind.sqlite northwind.sqlite
COPY schema.graphql schema.graphql

CMD [ "npm", "start" ]