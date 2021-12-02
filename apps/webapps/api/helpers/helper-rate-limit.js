/*
 *   Copyright (c) 2021 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const rateLimit = require('express-rate-limit');
const config = require('../../env/config');

/**
 * Simple utility for rate limiting that allows disabling via environment config
 */
class RateLimiter {
    static limit(ms, request_count) {
        if(config.disable_rate_limit) {
            //just do a noop if rate limiting is disabled
            return (req, res, next) => next();
        }

        return rateLimit({
            windowMs: ms,
            max: request_count
        });

    }
}

module.exports = RateLimiter;