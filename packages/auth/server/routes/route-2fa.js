/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const LoginController = require('../controllers/controller-login'),
    RateLimiter = require('../helpers/helper-rate-limit'),
    Util = require('../helpers/helper-util');
module.exports = (router) => {

    /**
     * Log in with a nonce token. Expected url param ?token=asdfasdfasdf
     */
    route('/api/2fa')
        .get(
            //rate limit to three times per minute
            RateLimiter.limit(60 * 60 * 1000, 3), 
            Util.wrap(AuthController.get)
        )
        .post(
            //rate limit to once per 5 minutes
            RateLimiter.limit(5 * 60 * 60 * 1000, 1), 
            Util.wrap(LoginController.sendNonceLink)
        );

    /**
     * Log in with a one time password. Expected body param code=asdf12, username=claytongulick, email_address=clay@ratiosoftware.com
     * code and one of username or email_address are required.
     * We use post for this because we don't want OTPs and user identifiers in any logs, even though GET would be the technically correct verb
     */
    app.route('/api/login/otp')
        .post(
            //rate limit to three times per minute
            RateLimiter.limit(60 * 60 * 1000, 3), 
            LoginController.loginWithOTP
        );
    /**
     * Send the OTP to the specified communication type
     */
    app.route('/api/login/otp/send')
        .post(
            //rate limit to once per 5 minutes
            RateLimiter.limit(5 * 60 * 60 * 1000, 1), 
            Util.wrap(LoginController.sendOTP)
        );

    /**
     * Send a login nonce to a specific user id
     */
    app.route('/api/login/nonce/:user_id')
        .post(
            //rate limit to once per 5 minutes
            RateLimiter.limit(5 * 60 * 60 * 1000, 1), 
            Util.wrap(LoginController.sendNonceLink)
        );

    /**
     * Allow an admin user to get a login link for other users in the system
     */
    app.route('/api/login/link/:user_id')
        .all(Authorization.authenticateJWT())
        .get(
            Authorization.hasRole('admin'),
            Util.wrap(LoginController.getLoginLink)
        );

    /**
     * Log in with normal username and password. This returns a JWT.
     */
    app.route('/api/login').post( LoginController.loginWithPassword);

    /**
     * Return the current authenticated uid
     */
    app.route('/api/whoami')
        .all(Authorization.authenticateJWT())
        .get( 
            Authorization.hasRole('*'), 
            LoginController.whoAmI 
        );



}