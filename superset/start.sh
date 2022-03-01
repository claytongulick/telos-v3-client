#!/bin/sh
gunicorn -w 4 -k gevent --timeout 120 -b localhost:8088 --limit-request-line 0 --limit-request-field_size 0 "superset.app:create_app()"
