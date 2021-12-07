const glob = require('glob');
const path = require('path');
const routes = [];

// Globbing routing files - auto-include all of our defined routes
glob.sync(`${__dirname}/**/*.js`).forEach(
    (routePath) => {
        //don't include this file
        if(routePath.includes('index.js'))
            continue;
        routes.push(
            require(path.resolve(routePath))
        );
    }
);

module.exports = routes;