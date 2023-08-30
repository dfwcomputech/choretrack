# Use the official OpenJDK base image
FROM eclipse-temurin:20

# Metadata as described above
LABEL maintainer="miguel.cumbay@live.com" \
      version="3.0" \
      description="ChoreTrack Application"

# Create a directory in the container where the app will be placed
WORKDIR /app

# Copy the Spring Boot fat-jar into our container
COPY choretrack-ui/target/choretrack-ui-0.0.1-SNAPSHOT.jar /app/choretrack-ui-0.0.1-SNAPSHOT.jar

# Specify the command to run on container start
CMD ["java", "-jar", "/app/choretrack-ui-0.0.1-SNAPSHOT.jar"]
