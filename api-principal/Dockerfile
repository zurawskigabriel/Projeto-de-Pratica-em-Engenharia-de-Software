FROM eclipse-temurin:21-jdk as builder

WORKDIR /app

# Copia arquivos de configuração do Maven
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Dá permissão de execução ao mvnw
RUN chmod +x mvnw

# Baixa dependências (para melhor cache do Docker)
RUN ./mvnw dependency:go-offline -B

# Copia código fonte
COPY src src

# Compila a aplicação
RUN ./mvnw clean package -DskipTests

# Estágio final
FROM eclipse-temurin:21-jre

WORKDIR /app

# Instala curl para healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copia o JAR da aplicação do estágio anterior
COPY --from=builder /app/target/*.jar app.jar

# Expõe a porta
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["java", "-jar", "app.jar"]