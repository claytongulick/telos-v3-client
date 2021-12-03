/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const ExportController = require('../controllers/controller-export'),
    Authorization = require('../helpers/helper-authorization'),
    Util = require('../helpers/helper-util');


module.exports = (app) => {
    app.route('/api/exports/collections/:model')
        .all(Authorization.authenticateJWT())
        .get(
            Authorization.hasRole('admin'),
            Util.wrap(ExportController.exportCollection)
        );
}