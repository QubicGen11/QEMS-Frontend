FROM node:20-alpine

WORKDIR /emsFE

COPY . .

RUN npm install

EXPOSE 8085

CMD ["npm","run","dev"]
