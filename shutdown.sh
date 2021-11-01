#!/bin/sh

#check to see if we're running locally. If so, source the local.env file
#for environment variables, this lets us run everything outside a container
#for running in a container, the Dockerfile will setup all the environment variables
#we look for a .env file in the parent directory, this doesn't get checked in to git
#the .env.local file in the git repo is a basis for creating the .env file in the parent directory
if [ -f ../.env ]
then
      set -o allexport
      source ../.env
      set +o allexport
fi

if [ "$TELOS_START_SUPERSET" == "1" ]
then
    #TODO: figure out how to shut down gunicorn
    echo "not implements, kill gunicorn manually"
fi

if [ "$TELOS_START_FHIR" == "1" ]
then
      #start FHIR server
      CATALINA_BASE=$FHIR_CATALINA_BASE $CATALINA_HOME/bin/shutdown.sh 
fi

if [ "$TELOS_START_CAMUNDA" == "1" ]
then
      #start FHIR server
      CATALINA_BASE=$CAMUNDA_CATALINA_BASE $CATALINA_HOME/bin/shutdown.sh &
fi

wait
