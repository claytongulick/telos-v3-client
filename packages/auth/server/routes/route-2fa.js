/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const Controller2FA = require('../controllers/controller-2fa'),
    Util = require('common/server/util');
module.exports = (router) => {

    router.route('/api/2fa/password')
        .post(
            Util.wrap(Controller2FA.authPassword)
        );

    router.route('/api/2fa/otp')
        .post(
            Util.wrap(Controller2FA.authOTP)
        );
}