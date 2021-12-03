/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';

/**
 controller-core.js

 Base controllers for non application specific routes, basic server housekeeping functions like isAlive, etc...

 @author Clay Gulick
 @email clay@ratiosoftware.com
**/

class Core {
    static isAlive(req, res) {
        res.json({
            status: 'OK'
        });
    }

    static serviceWorker(req, res, next) {
        req.sendFile('./dist/sw.js');

    }

}

module.exports = Core;