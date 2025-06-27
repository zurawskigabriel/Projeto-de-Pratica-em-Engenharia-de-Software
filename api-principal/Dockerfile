FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . /app
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

CMD ["sh", "-c", "java -jar target/*.jar"]

