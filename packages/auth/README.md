This is the Authenication and Authorization service.

Authentication works via *flows*

An Authentication *Flow* is a set of steps that a user (or machine) must go through in order to prove that they are who they claim to be.

For user authentication flows, a session is initially created that's "untrusted". The auth flow state and type are stored in the session for each step of the flow.

When a flow successfully completes, the session is upgraded to "trusted". Once a session is trusted, authorization checks can be performed.

This service supports the following flows:

* Password
The password flow has these steps:
1. Collect the username
2. Collect the password
3. Cryptographically verify the password
4. If valid, verify the redirect_url and redirect the user
5. If invalid login, redirect the use to the login for another attempt
6. If the attempts exceed MAX_PASSWORD_LOGIN_ATTEMPTS, lock the user's account

* One Time Password
The one time password flow supports logging in without the user needing to remember a password. A OTP_LENGTH size password is sent using with only numbers (OTP_NUMBERS_ONLY) or a random string.
1. Collect the username
2. Send the OTP to the registered phone number
3. Collect the OTP
4. Verify the OTP
5. If valid, verify the redirect_url and redirect the user
5. If invalid login, redirect the use to the login for another attempt
6. If the attempts exceed MAX_OTP_LOGIN_ATTEMPTS, lock the user's account

* 2FA - OTP
Two-factor authentication requires something the user *has* plus something the user *knows*. To implement this, we combine the password and the one time password flows.
1. Password login flow
2. One Time Password flow

* Webauthn
1. Credential 

* OpenID Connect
tbd

* SAML
tbd

