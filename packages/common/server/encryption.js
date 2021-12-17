/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const crypto = require('crypto');
const util = require('util');

/**
 * Crypto config is common and shared between all services
 */
let config = {
    digest: 'sha512',
    hash_iterations: 25000,
    hash_key_length: 512,
    hash_encoding: 'hex',
    salt_length: 32,
    //this is the secret used for symmetric encryption
    encryption_secret: process.env.CLIENT_SECRET,
};

/**
 * Utility function to simplify and unify all crypto
 */
class Encryption {
    static encrypt(text) {
        let cipher = crypto.createCipher('aes-256-cbc', config.encryption_secret);
        let crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;

    }

    static decrypt(text) {
        if (text === null || typeof text === 'undefined') { return text; };
        let decipher = crypto.createDecipher('aes-256-cbc', config.encryption_secret);
        let dec = decipher.update(text, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    }

    static async hash(text) {
        let buf = await util.promisify(crypto.randomBytes)(config.salt_length);

        // create new salt value for hashing the password:
        let salt = buf.toString(config.hash_encoding);

        let raw_hash = await util.promisify(crypto.pbkdf2)(text,
            salt,
            config.hash_iterations,
            config.hash_key_length,
            config.digest
        );

        let hash = raw_hash.toString(config.hash_encoding);
        return {
            hash,
            salt
        }
    }

    static async verifyPassword(password_hash, password, salt) {
        let raw_hash = await util.promisify(crypto.pbkdf2)(password,
            salt,
            config.hash_iterations,
            config.hash_key_length,
            config.digest);

        let string_hash = raw_hash.toString(config.hash_encoding);

        if(password_hash === string_hash)
            return true;

        return false;
    }

    static cryptoRandomString(length) {
        if (!Number.isFinite(length)) {
            throw new TypeError('Expected a finite number');
        }

        //return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
        let valid_chars =['1','2','3','4','5','6','7','8','9','0'];
        let otp = '';
        for(let i=0; i<length; i++) {
            otp += valid_chars[crypto.randomInt(valid_chars.length - 1)];
        }
        return otp;
    };

}

module.exports = Encryption;