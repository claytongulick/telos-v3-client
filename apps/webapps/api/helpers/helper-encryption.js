/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const crypto = require('crypto');
const util = require('util');
const bcrypt = require('bcryptjs');

const config = require('../../env/config');

/**
 * Utility function to simplify and unify all crypto
 */
class Encryption {
    static encrypt(text) {
        let cipher = crypto.createCipher('aes-256-cbc', config.crypto.encryption_secret);
        let crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;

    }

    static decrypt(text) {
        if (text === null || typeof text === 'undefined') { return text; };
        let decipher = crypto.createDecipher('aes-256-cbc', config.crypto.encryption_secret);
        let dec = decipher.update(text, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    }

    static async hash(text) {
        let buf = await util.promisify(crypto.randomBytes)(config.crypto.salt_length);

        // create new salt value for hashing the password:
        let salt = buf.toString(config.crypto.hash_encoding);

        let raw_hash = await util.promisify(crypto.pbkdf2)(text,
            salt,
            config.crypto.hash_iterations,
            config.crypto.hash_key_length,
            config.crypto.digest
        );

        let hash = raw_hash.toString(config.crypto.hash_encoding);
        return {
            hash,
            salt
        }
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

    static async bcrypt(text) {

    }
}

module.exports = Encryption;