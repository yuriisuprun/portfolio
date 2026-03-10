#
# Multi-stage build:
# 1) Build React frontend
# 2) Copy frontend build into Spring Boot static resources
# 3) Build runnable Spring Boot jar
# 4) Run with a small JRE image
#

FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


FROM maven:3.9.9-eclipse-temurin-17 AS backend-build
WORKDIR /app

# Cache Maven dependencies
COPY backend/pom.xml backend/pom.xml
RUN mvn -f backend/pom.xml -DskipTests dependency:go-offline

COPY backend/ backend/

# Bundle frontend into the backend jar (served from /)
RUN rm -rf backend/src/main/resources/static/* 2>/dev/null || true
COPY --from=frontend-build /app/frontend/build/ backend/src/main/resources/static/

RUN mvn -f backend/pom.xml -DskipTests package \
  && jar="$(find backend/target -maxdepth 1 -type f -name '*.jar' ! -name '*-sources.jar' ! -name '*-javadoc.jar' | head -n 1)" \
  && test -n "$jar" \
  && cp "$jar" /app/app.jar


FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

ENV JAVA_OPTS=""
EXPOSE 8080

COPY --from=backend-build /app/app.jar /app/app.jar

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
