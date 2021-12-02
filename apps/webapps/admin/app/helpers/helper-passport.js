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

const passport = require('passport');
const HeaderStrategy = require('passport-header');

/**
 * Main passport config function, this will call out to all of the login strategies we want to use
 * i.e. we may add OAuth, Google, FB, etc... later
 */
function configurePassport(config) {
    configureRemoteUser(config);
}

function configureRemoteUser() {

    const strategy = new HeaderStrategy.Strategy(
        async (remote_user, next) => {

            return next(null, remote_user);

        }
    );
    
    passport.use(strategy);
}

module.exports = {
    configurePassport: configurePassport
}
