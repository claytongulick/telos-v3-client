/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';

let User = require('../models/model-user');
let Profile = require('../models/model-profile');
let Nonce = require('../models/model-nonce');
let JWT = require('jsonwebtoken');
let uuid = require('uuid/v4');
let Communication = require('../models/model-communication');
let Encryption = require('./helper-encryption');
let SMS = require('./helper-sms');
let config = require('../../env/config');

class Authentication {

    static async setOTP(user_id) {
        let user = await User.findById(user_id, '_id otp');
        if(!user)
            throw new Error("Invalid user_id");

        let otp = await Authentication.createOTP();
        user.otp = otp;
        await user.save();
        return otp;
    }

    static async authenticateOTP(user_id, code, info) {
        let user = await User.findById(user_id, '_id otp');
        if(!user)
            throw new Error("Invalid user_id");

        let valid = await Authentication.validateOTP(user.otp, code);

        if(!valid) {
            user.otp.attempts += 1;
            await user.save();
            return false;
        }

        //the otp is valid. we're going to create a nonce for this login on the backend so that we can
        //kill the JWT later, if needed
        let nonce = await Authentication.createLoginNonce(user_id, {otp: true})
        user.otp.nonce = nonce._id;
        await user.save();

        let jwt = await Authentication.consumeNonce(nonce.nonce, {otp: true, ...info});
        return jwt;
    }

    /**
     * Create a one-time-password structure, including expiration
     * @param {*} user_id 
     */
    static async createOTP() {
        let code_length = 6;
        //use a cryptographically strong generation algorithm for code creation. Math.random() won't cut it
        let code = Encryption.cryptoRandomString(code_length);

        let otp = {
            code: code, //the generated code
            created_date: new Date(), //used to expire the OTP. Expiration is 3 minutes.
            attempts: 0, //we allow 3 attempts before a new code needs to be generated
            consumed: false, //this has not been used yet
            consumed_date: null
        }

        return otp;
    }

    static async validateOTP(otp, code) {
        if(!otp)
            return false;

        if(otp.consumed)
            return false;

        if(otp.attempts >= 3)
            return false;

        let ticks = new Date() - new Date(otp.created_date);
        let expiration = 1000 * 60 * 3; //three minutes in ms
        if(ticks > expiration)
            return false;

        if(otp.code !== code)
            return false;

        //passed all checks
        return true;

    }

    /**
     * Create a nonce for the given user id that can be used later to issue a JWT
     * @param user_id
     * @returns {Promise.<void>}
     */
    static async createLoginNonce(user_id, data) {
        let user = await User.findOne({_id: user_id});
        if(!user)
            throw new Error('Invalid user id');

        if(user.account_status !== 'active')
            throw new Error('User account is ' + user.account_status);

        let token = uuid();

        let nonce = new Nonce({
            nonce: token,
            create_date: new Date(),
            is_consumed: false,
            is_valid: true,
            data: {
                sub: user.id,
                nonce: token,
                ...data
            }
        });

        await nonce.save();

        return nonce;
    }

    /**
     * Consume a nonce and return a JWT
     * @param nonce
     * @param info
     * @returns {Promise.<boolean>}
     */
    static async consumeNonce(token, info) {
        let nonce = await Nonce.findOne({nonce: token});
        let allow = true;
        let reason = '';
        if(!nonce)
            return false;
        if(!nonce.is_valid) {
            allow = false;
            reason = "is_valid set to false";
        }
        if(nonce.single_use)
            if(nonce.is_consumed) {
                allow = false;
                reason = "is_consumed set to true";
            }
        if(nonce.expires_date < new Date()) {
            allow = false;
            let now = Date.now();
            reason = `expires_date (${nonce.expires_date}) < ${now}`;
        }

        if(!allow) {
            nonce.access_log.push(
                {
                    date: new Date(),
                    success: false,
                    data: info,
                    reason: reason
                }
            );
            await nonce.save();
            return false;
        }

        nonce.is_consumed = true;
        nonce.consumed_date = new Date();
        nonce.consumed_data = info;
        nonce.access_log.push(
            {
                date: new Date(),
                success: true,
                data: info
            }
        );
        let jwt = await Authentication.createJWT(nonce.data);

        await nonce.save();
        return jwt;
    }

    /**
     * Ensure that the nonce represented by the passed in token is valid and hasn't been deactivated
     * @param token
     * @returns {Promise.<boolean>}
     */
    static async validateNonce(nonce) {
        let nonce_record = await Nonce.findOne({nonce: nonce},'is_valid').lean();
        if(!nonce_record)
            return false;
        if(!nonce_record.is_valid) {
            return false;
        }
        //these checks don't apply when verifying a jwt, only when consuming a nonce
        //but we might do something with them later, so here for reference
        /*if(nonce_record.single_use)
            if(nonce_record.is_consumed) {
                return false;
            }
        if(nonce_record.expires_date < new Date()) {
            return false;
        }*/

        return true;
    }

    /**
     * Authenticate a user via a json web token and return a full user object.
     * Note: this is a utility function that should not be used in the general case.
     * JWT authentication is handled via passport JWT strategy in Authorization
     * @param jwt
     * @returns {Promise.<*>}
     */
    static async authenticate(jwt) {
        let data = await Authentication.decodeJWT(jwt);
        if(!data)
            return false;

        let valid = await Authentication.validateNonce(data.nonce);
        if(!valid)
            return false;

        let user = await User.findOne({_id: data.sub});
        if(!user)
            return false;

        if(user.account_status !== 'active')
            return false;

        user.last_login_date = new Date();
        await user.save();

        return user;

    }

    /**
     * Create a signed JWT with the given data
     * @param data
     * @returns {Promise}
     */
    static createJWT(data) {
        return new Promise(
            (resolve, reject) => {
                JWT.sign(
                    data,
                    config.client_secret,
                    {
                        issuer: 'app.kithandkin.app'
                    },
                    (err, jwt) => {
                        if(err)
                            return reject(err);
                        resolve(jwt);
                    }
                )
            }
        );
    }

    /**
     * Validate and return the data from a JWT
     * @param jwt
     * @returns {Promise}
     */
    static decodeJWT(jwt) {
        return new Promise(
            (resolve, reject) => {
                JWT.verify(
                    jwt,
                    config.sessionSecret,
                    {
                        issuer: 'app.kithandkin.app'
                    },
                    (err, data) => {
                        if(err)
                            return reject(err);
                        resolve(data);
                    }
                )
            }
        )

    }
}

module.exports = Authentication;