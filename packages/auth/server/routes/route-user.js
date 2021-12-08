/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const UserController = require('../controllers/controller-user'),
    Authorization = require('../helpers/helper-authorization'),
    Util = require('../helpers/helper-util');


module.exports = (app) => {

    /**
     * This is unauthenticated - we allow user profile without auth
     */
    app.route('/api/users/:user_id/avatar')
        .get(
            Util.wrap(UserController.getAvatar)
        );

    app.route('/api/users/:user_id')
        .all(Authorization.authenticateJWT())
        .get(
            Authorization.hasRole('self'),
            Util.wrap(UserController.getUser)
        )
        .patch(
            Authorization.hasRole('self'),
            Util.wrap(UserController.patchUser)
        );

    app.route('/api/users')
        .all(Authorization.authenticateJWT())
        .get(
            Authorization.hasRole('admin'),
            Util.wrap(UserController.getUsers)
        )
        .post(
            Authorization.hasRole('admin'),
            //UploadHelper.uploadMiddleware('user').none(),
            Util.wrap(UserController.createUser)
        );

}