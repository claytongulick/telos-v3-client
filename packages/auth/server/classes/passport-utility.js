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

const {User} = require('common/db/models'),
    config = require('../../config/config'),
    Authentication = require('./authentication'),
    passport = require('passport'),
    passport_jwt = require('passport-jwt'),
    passport_local = require('passport-local'),
    passport_custom = require('passport-custom'),
    crypto = require('crypto'),
    util = require('util');

/**
 * Main passport config function, this will call out to all of the login strategies we want to use
 * i.e. we may add OAuth, Google, FB, etc... later
 */
function configurePassport() {
    configureLocalStrategy();
    configureJWTStrategy();
    configureNonceStrategy();
    configureOTPStrategy();

    //additional strategies go here...
}

/**
 * Set up authentication for a JWT.
 * This trusts (based on the way JWTs work) the JWT user id claim, and simply loads the user from the db
 */
function configureJWTStrategy() {
    const options = {
        jwtFromRequest: passport_jwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.client_secret
    }

    const strategy = new passport_jwt.Strategy(options,
        async (payload, next) => {
            //the user. sub = subject of JWT. This is a standard registered JWT claim.
            const user_id = payload.sub;

            //we may want to use this in the future to age out some JWTs. This is also a standard JWT claim.
            const issued_at = payload.iat;

            const nonce = payload.nonce;

            //if we have a nonce, make sure it hasn't been voided
            if(nonce) {
                let nonce_record = await Nonce.findOne({nonce: nonce}, 'is_valid is_consumed').lean();
                if(!nonce_record)
                    return next(null, false, 'Invalid nonce');
                if(!nonce_record.is_valid)
                    return next(null, false, 'Voided nonce');
                if(!nonce_record.is_consumed)
                    return next(null, false, 'Unconsumed nonce');
            }

            let user = await User.findOne({_id: user_id}).lean();

            if(!user) {
                return next(null, false);
            }

            if(user.account_status != 'active')
                return next(null, false);

            await User.updateOne({_id: user_id}, {last_login_date: new Date()});

            return next(null, user);

        }
    );
    
    passport.use(strategy);
}

function configureLocalStrategy() {
    const strategy = new passport_local.Strategy(
        async (username, password, done) => {
            try {
                let user = await User.findOne({username: username}).select("+salt +hash").exec();
                if(!user)
                    return done(null, false, 'Invalid username');
                if(!user.account_status == 'active')
                    return done(null, false, 'Inactive account');

                let password_hash = user.hash;
                let salt = user.salt;

                if(!password_hash)
                    return done(null, false, 'User does not have password configured');
                if(!salt)
                    return done(null, false, 'User doesn not have valid salt');

                let raw_hash = await util.promisify(crypto.pbkdf2)(password,
                    salt,
                    config.crypto.hash_iterations,
                    config.crypto.hash_key_length,
                    config.crypto.digest);

                let string_hash = raw_hash.toString(config.crypto.hash_encoding);

                if(password_hash !== string_hash)
                    return done(null, false, 'Invalid password');

                return done(null, user);
            }
            catch(err) {
                done(err);
            }
        }
    );
    passport.use(strategy);

}

function configureOTPStrategy() {
    const strategy = new passport_custom(
        async function(req, done) {
            try {

                let code = req.body.code;
                //let phone_cell = req.body.phone_cell;
                let email_address = req.body.email_address;
                let user_id = req.body.user_id;
                let username = req.body.username;
                
                if(!code)
                    return done(null, false, 'Missing code');

                code = code.toLowerCase();

                if(!(user_id || email_address || username)) {
                    return done(null, false, "Missing identifier");
                }

                let user;
                //first try user_id, it's the most specific
                if(user_id) {
                    user = await User.findOne({_id: user_id},'_id').lean();
                }
                //then try username
                else if(username) {
                    user = await User.findOne({username: username},'_id').lean();
                }
                //email should be unique as well
                else if(email_address) {
                    user = await User.findOne({email_address: email_address},'_id').lean();
                }
                if(!user) {
                    return done(null, false, "Invalid user");
                }

                let jwt = await Authentication.authenticateOTP(user._id, code, {headers: req.headers, ip: req.ip});
                if(!jwt)
                    return done(null, false, "Failed OTP login");

                done(null, jwt);
            }
            catch(err) {
                done(err);
            }
        }
    );
    passport.use('otp', strategy);
}

module.exports = {
    configurePassport: configurePassport
}
