from flask_appbuilder.security.manager import (
    AUTH_DB,
    AUTH_LDAP,
    AUTH_OAUTH,
    AUTH_OID,
    AUTH_REMOTE_USER
)

from custom_sso_security_manager import CustomSsoSecurityManager

# Superset specific config
ROW_LIMIT = 5000

SUPERSET_WEBSERVER_PORT = 8088

# Flask App Builder configuration
# Your App secret key
SECRET_KEY = 'wTPpR5KxL0BluOAKF5jY5kCPhteNwDXJYVMWhzap'

# The SQLAlchemy connection string to your database backend
# This connection defines the path to the database that stores your
# superset metadata (slices, connections, tables, dashboards, ...).
# Note that the connection information to connect to the datasources
# you want to explore are managed directly in the web UI
SQLALCHEMY_DATABASE_URI = 'postgres://superset:irHmXglplSjXNeXmLOpBSMMvSupttLHzXYWWpUlv@localhost/superset'

# Flask-WTF flag for CSRF
WTF_CSRF_ENABLED = True
# Add endpoints that need to be exempt from CSRF protection
WTF_CSRF_EXEMPT_LIST = []
# A CSRF token that expires in 1 year
WTF_CSRF_TIME_LIMIT = 60 * 60 * 24 * 365

# Set this API key to enable Mapbox visualizations
MAPBOX_API_KEY = ''

ENABLE_PROXY_FIX = True

AUTH_TYPE = AUTH_OAUTH
OAUTH_PROVIDERS = [
    {   'name':'mattermost',
        'token_key':'access_token', # Name of the token in the response of access_token_url
        'icon':'fa-address-card',   # Icon for the provider
        'remote_app': {
            'client_id':'yrzcoqgr3fb1ic4obr7x8m4gke',  # Client Id (Identify Superset application)
            'client_secret':'r1ksf53yr3f15jk3n9tjtb78zo', # Secret for this Client Id (Identify Superset application)
            'client_kwargs':{
                'scope': 'read'               # Scope for the Authorization
            },
            'access_token_method':'POST',    # HTTP Method to call access_token_url
            'access_token_params':{        # Additional parameters for calls to access_token_url
                'client_id':'yrzcoqgr3fb1ic4obr7x8m4gke',
                'client_secret':'r1ksf53yr3f15jk3n9tjtb78zo', 
            },
            'access_token_headers':{    # Additional headers for calls to access_token_url
                'Authorization': 'Basic Base64EncodedClientIdAndSecret'
            },
            'api_base_url':'https://telos.teloshs.com/collab/oauth/',
            'access_token_url':'https://telos.teloshs.com/collab/oauth/access_token',
            'authorize_url':'https://telos.teloshs.com/collab/oauth/authorize'
        }
    }
]

# Will allow user self registration, allowing to create Flask users from Authorized User
AUTH_USER_REGISTRATION = False

# The default user self registration role
AUTH_USER_REGISTRATION_ROLE = "Gamma"

# Custom script to retrieve user details from mattermost
CUSTOM_SECURITY_MANAGER = CustomSsoSecurityManager
