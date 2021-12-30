let PasswordController = require('../controllers/controller-password');
let Util = require('common/server/util');

module.exports = (router) => {
    /**
     * Log in with normal username and password. This returns a JWT.
     */
    router.route('/api/login').post( Util.wrap(PasswordController.loginWithPassword) );

}