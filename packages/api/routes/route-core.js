/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';

/**
 route-core.js

 Core server routes with generic functionality that's not application specific, such as isalive and whoami

 @author Clay Gulick
 @email clay@ratiosoftware.com

 **/

const Core = require('../controllers/controller-core');

module.exports = (app) => {

    /**
     * Most basic route, simple "is alive" check to see if the server is running
     */
    app.route('/isalive').get(Core.isAlive);

    /**
     * Ensure the service worker is served with no cache and other optimizations
     */
    app.route('/sw.js').get(Core.serviceWorker);

    /**
     * Protect media, require auth
     * TODO: make this work with jwt in secure cookie
     */
    //app.route('/projects/:folder/:image')
};
