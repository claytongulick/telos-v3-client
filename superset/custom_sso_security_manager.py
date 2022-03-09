import logging
from superset.security import SupersetSecurityManager

class CustomSsoSecurityManager(SupersetSecurityManager):

    def oauth_user_info(self, provider, response=None):
        logging.debug("Oauth2 provider: {0}.".format(provider))
        if provider == 'mattermost':
            result = self.appbuilder.sm.oauth_remotes[provider].get('api/v4/users/me')
            user = result.json()
            logging.debug("user_data: {0}".format(user))
            return { 
                    'username' : user.get('email'), 
                    'email' : user.get('email'), 
                    'first_name': user.get('first_name',''), 
                    'last_name': user.get('last_name','')
                   }

    #the below is just for debugging oauth
    #def set_oauth_session(self, provider, oauth_response):
    #    """
    #        Set the current session with OAuth user secrets
    #    """
    #    logging.warn("WTF")
    #    # Get this provider key names for token_key and token_secret
    #    token_key = self.appbuilder.sm.get_oauth_token_key_name(provider)
    #    logging.warn("token_key: {0}".format(token_key))
    #    token_secret = self.appbuilder.sm.get_oauth_token_secret_name(provider)
    #    logging.warn("token_secret: {0}".format(token_secret))
    #    logging.warn("oauth_response: {0}".format(oauth_response))
    #    # Save users token on encrypted session cookie
    #    session["oauth"] = (
    #        oauth_response[token_key],
    #        oauth_response.get(token_secret, ""),
    #    )
    #    session["oauth_provider"] = provider
