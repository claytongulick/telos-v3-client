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

/**
 * Basically all this does is extract headers, there's not much to it.
 * We use the lib so that we're staying consistent with passport strategies for *all* auth
 */
const TrustedHeaderStrategy = require('passport-trusted-header');

/**
 * Main passport config function, this will call out to all of the login strategies we want to use
 * i.e. we may add OAuth, Google, FB, etc... later
 */
function configurePassport(config) {
    configureRemoteUser(config);
}

function configureRemoteUser() {

    const strategy = new TrustedHeaderStrategy.Strategy({
            //use REMOTE_USER standard header from proxy server
            headers: ['REMOTE_USER']

        },
        async (headers, next) => {
            //REMOTE_USER will have a fqn: https://<client_id>.telhoshs.com/auth/api/user/<username>
            //we trust the proxy server to have already verified the user, the organization affiliation
            //and the user's role for accessing the admin app

            //TODO: fetch the user info from the fqn location

            return next(null, headers.REMOTE_USER);

        }
    );
    
    passport.use('remote', strategy);
}

module.exports = {
    configurePassport: configurePassport
}
