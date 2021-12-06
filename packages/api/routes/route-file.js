/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const FileController = require('../controllers/controller-file'),
    Authorize = require('../helpers/helper-authorization'),
    Util = require('../helpers/helper-util'),
    multer = require('multer'),
    path = require('path'),
    Activity = require('../helpers/helper-activity'),
    config = require('../../env/config');

//consider if we want to use disk storage?
const upload = multer({dest: path.join(config.uploads_dir, 'temp')});

module.exports = (app) => {

    app.route('/api/files/:file_id')
        .all(
            Authorize.authenticateJWT()
        )
        .get(
            Util.wrap(Authorize.authorizeEntityAccess('view')),
            Util.wrap(FileController.get),
        )
        .delete(
            Util.wrap(Authorize.authorizeEntityAccess(ACL.PERMISSION_EDIT)),
            Util.wrap(FileController.delete),
        );

    app.route('/api/files/:file_id/upload')
        .post(
            Authorize.authenticateJWT(),
            Util.wrap(Authorize.authorizeEntityAccess(ACL.PERMISSION_EDIT)),
            upload.array('file'),
            Util.wrap(FileController.upload),
        );

    //this is an unauthenticated route that *only* returns file status. Nothing else.
    //it is unauthenticated for optimization because it's polled, and there's no context or data leaked
    app.route('/api/files/:file_id/status')
        .get(
           Util.wrap(FileController.status) 
        );
    
    app.route('/api/files')
        .all(
            Authorize.authenticateJWT()
        )
        .post(
            Util.wrap(Authorize.authorizeEntityAccess(ACL.PERMISSION_EDIT)),
            Util.wrap(FileController.create),
        )
}
