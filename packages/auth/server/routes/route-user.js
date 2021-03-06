/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const UserController = require('../controllers/controller-user'),
    Util = require('common/server/util');


module.exports = (router) => {

    /**
     * This is unauthenticated - we allow user profile without auth
     */
    router.route('/api/users/:user_id/avatar')
        .get(
            Util.wrap(UserController.getAvatar)
        );
        
    /**
     * Return the current authenticated uid
     */
    router.route('/api/whoami')
        .get( 
            UserController.whoAmI 
        );


    router.route('/api/users/:email_address')
        .get(
            Util.wrap(UserController.getBasicUser)
        );
}