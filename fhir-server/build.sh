#!/bin/sh

#mvn -ntp dependency:go-offline
#mvn clean install -DskipTests
mvn clean package spring-boot:repackage -Pboot -DskipTests