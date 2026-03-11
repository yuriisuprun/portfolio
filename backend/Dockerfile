FROM maven:3.9.9-eclipse-temurin-17 AS backend-build
WORKDIR /app

COPY pom.xml ./pom.xml
RUN mvn -f pom.xml -DskipTests dependency:go-offline

COPY src ./src

RUN mvn -f pom.xml -DskipTests package \
  && jar="$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*-sources.jar' ! -name '*-javadoc.jar' | head -n 1)" \
  && cp "$jar" /app/app.jar

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
ENV JAVA_OPTS=""
EXPOSE 8080
COPY --from=backend-build /app/app.jar /app/app.jar
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]