mvn -ntp dependency:go-offline
mvn clean install -DskipTests
mvn clean package spring-boot:repackage -Pboot
cp ./target/ROOT.war ./target/fhir.war