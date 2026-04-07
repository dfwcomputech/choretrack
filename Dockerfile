# Stage 1: Build the React UI
FROM node:20 AS ui-build
WORKDIR /app/ui
COPY ui/package*.json ./
RUN npm ci
COPY ui/ .
RUN npm run build

# Stage 2: Build the Spring Boot backend
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app
COPY backend/ ./backend/
COPY --from=ui-build /app/ui/dist /app/backend/src/main/resources/static
RUN mvn -f backend/pom.xml clean package -DskipTests -Dskip.npm=true

# Stage 3: Runtime image
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
