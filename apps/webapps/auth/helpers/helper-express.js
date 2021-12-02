/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';

/**
 * helper-express.js
 *
 * Utility to configure and launch express server
 *
 * @author Clay Gulick
 * @email clay@ratiosoftware.com
 *
 */


/**
 * Module dependencies.
 */
var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    helmet = require('helmet'),
    methodOverride = require('method-override'),
    config = require('../../../../env/config'),
    glob = require('glob'),
    winston = require('winston'),
    compress = require('compression'),
    path = require('path'),
    rfs = require('rotating-file-stream'),
    compression = require('compression'),
    serverTiming = require('server-timing'),
    RateLimiter = require('./helper-rate-limit');

// Initialize express app
app = express();
let app_config = config.webapps.find(
    app_config => app_config.name == 'proxy-admin'
);
if(!app_config)
    throw new Error("Missing app config for proxy-admin");

//enable server timing functions on express
app.use(serverTiming());

//enable global rate limiting.
//300 requests per minute should be sufficient for any conceivably valid case. 
app.use(RateLimiter.limit(60 * 1000, 300));

//set log level
winston.level = app_config.log_level;

// Use helmet to secure Express headers
app.use(helmet.frameguard('sameorigin'));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());
app.disable('x-powered-by');

//enable gzip
app.use(compression());

//if forcing https, force redirect on http request
app.use(function(req, res, next) {
    if(app_config.ssl.force)
        if(!req.secure) 
            return res.redirect(['https://', req.get('Host'), req.url].join(''));

  next();
});

//configure statics
if (typeof app_config.statics_dir == 'string')
    //e-tags are calculated at request time, the whole file is read. We'll use last-modified for caching
    app.use(express.static(path.resolve(config.statics_dir),{etag: false}));
else if (Array.isArray(app_config.statics_dir))
    app_config.statics_dir.forEach(
        function (dir) {
            app.use(express.static(path.resolve(dir),{etag: false}));
        }
    );

//set up http request logging
if(['development','qa','production'].includes(process.env.NODE_ENV)) {
    var accessLogStream = rfs('access.log', {
        interval: app_config.web_logs.rotation_interval, 
        path: app_config.web_logs.path
        });
    app.use(morgan('combined', { stream: accessLogStream }));
}
else {
    app.use(morgan('combined'));
}


//make json output pretty
app.set('json spaces', 2);

//disable any sort of view caching
app.set('view cache', false);

// Should be placed before express.static
app.use(compress({
    filter: function (req, res) {
        return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level: 9
}));

// Request body parsing middleware should be above methodOverride
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '10mb'
}));

//allow the use of modern http verbs for older clients that might not support them (PUT, etc...)
app.use(methodOverride());

// Globbing routing files - include all of our defined routes
glob.sync('./app/routes/**/*.js').forEach(function (routePath) {
    require(path.resolve(routePath))(app);
});

//logging error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    next(err);
});

//send json error
app.use((err, req, res, next) => {
    res.status(500).send({ error: err.stack });
});

module.exports = app;