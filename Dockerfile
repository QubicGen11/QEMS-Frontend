FROM node:20-alpine

WORKDIR /emsFE

COPY . .

RUN npm install --legacy-peer-deps

EXPOSE 8085

CMD ["npm","run","dev"]
