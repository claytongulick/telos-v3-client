/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const OTPController = require('../controllers/controller-otp'),
    RateLimiter = require('../helpers/helper-rate-limit'),
    Util = require('../helpers/helper-util');
module.exports = (router) => {
    /**
     * Log in with a one time password. Expected body param code=asdf12, username=claytongulick, email_address=clay@ratiosoftware.com
     * code and one of username or email_address are required.
     * We use post for this because we don't want OTPs and user identifiers in any logs, even though GET would be the technically correct verb
     */
    router('/api/otp/login')
        .post(
            //rate limit to three times per minute
            RateLimiter.limit(60 * 60 * 1000, 3), 
            OTPController.login
        );
    /**
     * Send the OTP to the specified communication type
     */
    router('/api/otp/send')
        .post(
            //rate limit to once per 5 minutes
            RateLimiter.limit(5 * 60 * 60 * 1000, 1), 
            Util.wrap(OTPController.send)
        );
}