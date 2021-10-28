#!/bin/sh

#start superset
gunicorn -w 10 \
      -k gevent \
      --timeout 120 \
      -b 0.0.0.0:5000 \
      --limit-request-line 0 \
      --limit-request-field_size 0 \
      "superset.app:create_app()" &



wait