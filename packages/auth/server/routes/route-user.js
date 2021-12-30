/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const UserController = require('../controllers/controller-user'),
    Util = require('common/server/util');


module.exports = (app) => {

    /**
     * This is unauthenticated - we allow user profile without auth
     */
    app.route('/api/users/:user_id/avatar')
        .get(
            Util.wrap(UserController.getAvatar)
        );
        
    /**
     * Return the current authenticated uid
     */
    app.route('/api/whoami')
        .get( 
            UserController.whoAmI 
        );


    app.route('/api/users/:email_address')
        .get(
            Authorization.hasRole('self'),
            Util.wrap(UserController.getBasicUser)
        );
}