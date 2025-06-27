FROM node:18

WORKDIR /app

COPY . /app
RUN npm install -g expo-cli
RUN npm install

CMD ["npx", "expo", "start", "--tunnel"]
