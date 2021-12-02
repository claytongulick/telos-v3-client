/*
 *   Copyright (c) 2021 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const Util = require('../helpers/helper-util');
const ControllerWebhooks = require('../controllers/controller-webhooks');
const path = require('path');
const config = require('../../env/config');
const multer = require('multer');

const upload = multer({dest: path.join(config.uploads_dir, 'temp')});

module.exports = (app) => {

    /**
     * Most basic route, simple "is alive" check to see if the server is running
     */
    app.route('/api/webhooks/invitation').post(
        upload.array('file'),
        Util.wrap(ControllerWebhooks.invitation)
    );

};
