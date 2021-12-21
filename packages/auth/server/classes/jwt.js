let jsonwebtoken = require('jsonwebtoken');
class JWT {

    /**
     * Create a signed JWT with the given data
     * @param data
     * @returns {Promise}
     */
    static createJWT(data) {
        return new Promise(
            (resolve, reject) => {
                jsonwebtoken.sign(
                    data,
                    config.client_secret,
                    {
                        issuer: process.env.HOSTNAME
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
                jsonwebtoken.verify(
                    jwt,
                    config.client_secret,
                    {
                        issuer: process.env.HOSTNAME
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

module.exports = JWT;