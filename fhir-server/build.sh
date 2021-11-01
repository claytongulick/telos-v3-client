mvn -ntp dependency:go-offline
mvn clean install -DskipTests
mvn package spring-boot:repackage -Pboot
cp ./catalina.properties ./target
mkdir ./target/conf
cp ./pom.xml ./target/conf
cp ./server.xml ./target/conf
mkdir ./target/logs