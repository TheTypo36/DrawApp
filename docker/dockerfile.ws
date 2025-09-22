FROM node:18-alpine

WORKDIR /app
# COPY package.json ./package.json
# COPY ./package-lock.json package-lock.json

RUN npm install -g pnpm

COPY . .
RUN pnpm install

RUN pnpm run db:migrate
RUN pnpm run build



EXPOSE 8082
CMD ["pnpm","run","start:websocket"]