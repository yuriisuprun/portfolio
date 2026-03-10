FROM maven:3.9.9-eclipse-temurin-17 AS backend-build
WORKDIR /app

# Cache Maven dependencies
COPY backend/pom.xml backend/pom.xml
RUN mvn -f backend/pom.xml -DskipTests dependency:go-offline

COPY backend/ backend/

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
