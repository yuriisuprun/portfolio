FROM maven:3.9.9-eclipse-temurin-21 AS backend-build
WORKDIR /app

COPY pom.xml ./pom.xml
RUN mvn -f pom.xml -DskipTests dependency:go-offline

COPY src ./src

RUN mvn -f pom.xml -DskipTests package \
  && jar="$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*-sources.jar' ! -name '*-javadoc.jar' | head -n 1)" \
  && cp "$jar" /app/app.jar

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Prefer IPv4 by default: some hosts have broken IPv6 which can cause SMTP connect attempts to time out.
# Can be overridden at runtime by setting JAVA_OPTS explicitly.
ENV JAVA_OPTS="-Djava.net.preferIPv4Stack=true"
EXPOSE 8082
COPY --from=backend-build /app/app.jar /app/app.jar
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
