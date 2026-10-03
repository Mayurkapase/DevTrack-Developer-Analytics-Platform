# =============================================================================
# DevTrack AI - Backend Dockerfile
# Multi-Stage Build: Eclipse Temurin 21 JDK -> Lightweight JRE Runtime
# =============================================================================

# Stage 1: Build JAR with Maven
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper & POM
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build production artifact
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Minimal Production JRE Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user for enterprise security
RUN addgroup -S devtrack && adduser -S devtrack -G devtrack
USER devtrack

COPY --from=builder /app/target/devtrack-ai-1.0.0.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
