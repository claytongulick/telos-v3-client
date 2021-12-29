const glob = require('glob');
const path = require('path');
const routes = [];
const express = require('express');

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
router.__telos_mount_path = '/admin'
for(let route of routes) {
    route(router);
}

module.exports = router;