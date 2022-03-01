* INSTALLATION
superset is deloyed as the "superset" user in /home/superset

copy all these files into the /home/superset home directory

python3 and pip and such are required

installing from requirements.txt as superset user will install all deps locally into /home/superset/.local

* To get superset cli to work, you'll need to source .profile

this can be done by . .profile or via source ~/.profile

that will set up PYTHONPATH and PATH to make everything work

* Running superset requires the PYTHONPATH to include /home/superset

This is so that it can pick up the superset_config.py - if this isn't in the PYTHONPATH nothing will work.

All python dependencies are installed locally in ~/ so superset must be run as the "superset" user

* Auth

Auth is set up to use OAuth and the mattermoset OAuth provider for SSO

It uses a comnination of superset_config.py and custom_sso_security_manager.py

* Web

nginx is set up to load/run superset at https://reporting.teloshs.com
nginx reverse proxies over to gunicorn, which is configured to run in the systemd unit file

the default admin user is stored in the telos system credentials file.

* systemd
the systemd unit file points to the ~/environment file for environment settings

