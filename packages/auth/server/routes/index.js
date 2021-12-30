const glob = require('glob');
const path = require('path');
const express = require('express');
const routes = [];

// Globbing routing files - auto-include all of our defined routes
glob.sync(`${__dirname}/**/*.js`).forEach(
    (routePath) => {
        //don't include this file
        if(routePath.includes('index.js'))
            return;
        routes.push(
            require(path.resolve(routePath))
        );
    }
);

let router = express.Router();
router.__telos_mount_path = '/auth'
for(let route of routes) {
    route(router);
}

module.exports = router;
