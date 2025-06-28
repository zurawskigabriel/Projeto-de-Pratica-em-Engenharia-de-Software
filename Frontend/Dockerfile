# Usa a imagem base do Node 18
FROM node:18

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de definição de pacotes
COPY package*.json ./

# Instala as dependências do projeto (isso inclui o CLI local do Expo)
RUN npm install

# Copia todo o resto do código do frontend
COPY . .

# Expõe as portas necessárias para o Expo
EXPOSE 8081 19000 19001 19002

# Comando para iniciar o Expo.
# Usa "npm start", que é o script padrão do projeto.
# O "--" passa os argumentos seguintes diretamente para o comando "expo start".
# Adiciona "--clear" para limpar o cache do Metro a cada inicialização.
CMD ["npm", "start", "--", "--host", "tunnel"]