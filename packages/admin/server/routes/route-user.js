/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const UserController = require('../controllers/controller-user'),
    Util = require('common/server/util');


module.exports = (app) => {

    app.route('/api/users/:user_id')
        .get(
            Util.wrap(UserController.getUser)
        )
        .patch(
            Util.wrap(UserController.patchUser)
        );

    app.route('/api/users')
        .get(
            Util.wrap(UserController.getUsers)
        )
        .post(
            Util.wrap(UserController.createUser)
        );

}