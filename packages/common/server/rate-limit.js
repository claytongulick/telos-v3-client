/*
 *   Copyright (c) 2021 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const rateLimit = require('express-rate-limit');

/**
 * Simple utility for rate limiting that allows disabling via environment config
 * Wraps express-rate-limit to provide options to enhace functionality globally
 */
class RateLimiter {
    static limit(ms, request_count) {

        return rateLimit({
            windowMs: ms,
            max: request_count
        });

    }
}

module.exports = RateLimiter;