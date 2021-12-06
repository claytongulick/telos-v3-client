/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';

/**
 * helper-passport.js
 * 
 * Utitlity functions to configure passport 
 * 
 * @author Clay Gulick
 * @email clay@ratiosoftware.com
 */

const User = require('../models/model-user'),
    config = require('../../env/config'),
    Nonce = require('../models/model-nonce'),
    passport = require('passport'),
    passport_jwt = require('passport-jwt'),
    util = require('util');

/**
 * Main passport config function, this will call out to all of the login strategies we want to use
 * i.e. we may add OAuth, Google, FB, etc... later
 */
function configurePassport() {
    configureJWT();
}

/**
 * Set up jwt auth
 */
function configureJWT() {
    const options = {
        jwtFromRequest: passport_jwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.jwt_secret
    }

    const strategy = new passport_jwt.Strategy(options,
        async (payload, next) => {
            //the user. sub = subject of JWT. This is a standard registered JWT claim.
            const user_id = payload.sub;

            //we may want to use this in the future to age out some JWTs. This is also a standard JWT claim.
            const issued_at = payload.iat;

            return next(null, payload.sub);

        }
    );
    
    passport.use(strategy);
}

module.exports = {
    configurePassport: configurePassport
}
