FROM maven:3.8.2-jdk-11-slim as build-hapi
WORKDIR /tmp/fhir-server-build

COPY fhir-sever/ ./
RUN mvn -ntp dependency:go-offline
RUN mvn clean package spring-boot:repackage -Pboot -DskipTests

FROM ubuntu:20.04

#this is the port NodeJS will run on
EXPOSE 3000

#this is the port HAPI FHIR REST server will run on
EXPOSE 4000

#this is the port superset will run on
EXPOSE 5000

#this is the port the workflow engine will run on
EXPOSE 6000

# Superset configuration
# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

ENV FLASK_APP=superset
ENV PYTHONPATH "${PYTHONPATH}:/superset"

RUN mkdir /app
RUN mkdir /app/bin
RUN mkdir /app/superset
RUN mkdir /app/fhir-server
RUN mkdir /app/temp

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
RUN adduser --disabled-password --gecos "" app && chown -R app /app

#superset and dependencies
RUN apt-get update && \
    apt-get install -y build-essential libssl-dev libffi-dev python3-dev python3-pip libsasl2-dev libldap2-dev && \
    python3 -m pip install gunicorn && \
    python3 -m pip install gunicorn[gevent] && \
    python3 -m pip install apache-superset

#JDK 
RUN apt-get install default-jdk 

#the tomcat installation will live in /app/bin
ENV FHIR_BASE /app/fhir
ENV CAMUNDA_BASE /app/camunda

#stop running as root now
USER app

#collect our dev files
COPY ./superset /app/superset
COPY --from=build-hapi /tmp/fhir-server-build/target/ROOT.war /app/fhir-server/fhir.war
COPY startup.sh /app/startup.sh

#make it go
CMD ["/usr/bin/bash", "startup.sh"]
